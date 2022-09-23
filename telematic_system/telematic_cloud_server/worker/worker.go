package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/nats-io/nats.go"
)

func healthz(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "OK")
}

// Convert nested json into flattened json
func Flatten(m map[string]interface{}) map[string]interface{} {
	o := map[string]interface{}{}
	for k, v := range m {
		switch child := v.(type) {
		case map[string]interface{}:
			nm := Flatten(child)
			for nk, nv := range nm {
				o[k+"."+nk] = nv
			}
		case []interface{}:
			for i := 0; i < len(child); i++ {
				o[k+"."+strconv.Itoa(i)] = child[i]
			}
		default:
			o[k] = v
		}
	}
	return o
}

// Transform the JSON object into line protocol format that can be used to persist into influxDB
func transform_data2line(data map[string]interface{}) string {
	// Transform metadata
	topic_name := data["topic_name"]
	event_name := data["event_name"]
	location := data["location"]
	testing_type := data["testing_type"]
	unit_id := data["unit_id"]
	unit_type := data["unit_type"]
	timestamp := data["timestamp"].(float64)
	// Add metadata to line
	line := fmt.Sprintf("%v,", event_name) + "topic_name" + fmt.Sprintf("=%v,", topic_name) + "location" + fmt.Sprintf("=%v,", location) + "testing_type" + fmt.Sprintf("=%v,", testing_type) + "unit_id" + fmt.Sprintf("=%v,", unit_id) + "unit_type" + fmt.Sprintf("=%v", unit_type)

	// Transform actual payload
	payload := data["payload"].(map[string]interface{})
	flattened_payload := Flatten(payload)

	concatenated := ""
	i := 0
	for k, v := range flattened_payload {
		i++
		if i == len(flattened_payload) {
			if _, ok := v.(string); ok {
				s, err := strconv.ParseFloat(v.(string), 64)
				if err == nil {
					concatenated += fmt.Sprintf("%s=%f", k, s)
				} else {
					concatenated += fmt.Sprintf("%s=\"%s\"", k, v)
				}
			} else if _, ok := v.(map[string]interface{}); ok {
				flattened_ := Flatten(v.(map[string]interface{}))
				ii := 0
				for kk, vv := range flattened_ {
					ii++
					if len(flattened_) == ii {
						concatenated += fmt.Sprintf("%s.%s=%f", k, kk, vv)
					} else {
						concatenated += fmt.Sprintf("%s.%s=%f,", k, kk, vv)
					}
				}
			} else {
				concatenated += fmt.Sprintf("%s=%f", k, v)
			}
		} else {
			if _, ok := v.(string); ok {
				s, err := strconv.ParseFloat(v.(string), 64)
				if err == nil {
					concatenated += fmt.Sprintf("%s=%f,", k, s)
				} else {
					concatenated += fmt.Sprintf("%s=\"%s\",", k, v)
				}
			} else if _, ok := v.(map[string]interface{}); ok {
				flattened_ := Flatten(v.(map[string]interface{}))
				for kk, vv := range flattened_ {
					concatenated += fmt.Sprintf("%s.%s=%f,", k, kk, vv)
				}
			} else {
				concatenated += fmt.Sprintf("%s=%f,", k, v)
			}
		}
	}
	// Add actual payload to line
	line += fmt.Sprintf(" %s", concatenated)

	// Add timestamp to line
	t := time.UnixMicro(int64(timestamp))
	line += fmt.Sprintf(" %d", t.UTC().UnixMicro())
	return line
}

// Use write client for writing data into desired bucket
func write2influxDB(line string) {
	influxdb_token := os.Getenv("INFLUXDB_TOKEN")
	influxdb_uri := os.Getenv("INFLUXDB_URI")
	influxdb_bucket := os.Getenv("INFLUXDB_BUCKET")
	influxdb_org := os.Getenv("INFLUXDB_ORG")
	client := influxdb2.NewClientWithOptions(influxdb_uri, influxdb_token, influxdb2.DefaultOptions())
	writeAPI := client.WriteAPIBlocking(influxdb_org, influxdb_bucket)
	writeAPI.WriteRecord(context.Background(), line)
	writeAPI.Flush(context.Background())
	client.Close()
	fmt.Printf("%s\n", "Write to influxDB.")
}

func stream_data(nc *nats.Conn) {
	// Subscribe to NATS topcis that are publishing actual data
	nc.Subscribe("*.data.>", func(m *nats.Msg) {
		// callback for add the data published in the system
		// *.data.> is a pattern that matches the topics from units
		var data map[string]interface{}
		err := json.Unmarshal(m.Data, &data)
		if err != nil {
			fmt.Printf("could not unmarshal json: %s\n", err)
			return
		}
		line := transform_data2line(data)
		fmt.Printf("%s\n", line)

		// Persist data stream into influxDB
		write2influxDB(line)
	})
}

func main() {
	// connecting to NATS server
	nats_uri := os.Getenv("NATS_URI")
	var nats_err error
	var nc *nats.Conn

	// wait atleast 5s for nats server
	for i := 0; i < 5; i++ {
		nc, nats_err = nats.Connect(nats_uri)
		if nats_err == nil {
			break
		}

		fmt.Println("Waiting before connecting to NATS at:", nats_uri)
		time.Sleep(1 * time.Second)
	}
	if nats_err != nil {
		log.Fatal("Error establishing connection to NATS:", nats_err)
	}
	fmt.Println("Successfully Connected to NATS at:", nc.ConnectedUrl())

	// Stream data by subscribing to data topics
	stream_data(nc)

	fmt.Println("Server listening on port 8181...")
	http.HandleFunc("/healthz", healthz)
	if err := http.ListenAndServe(":8181", nil); err != nil {
		log.Fatal(err)
	}
}
