package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"
	"github.com/nats-io/nats.go"
)

type server struct {
	nc *nats.Conn
}

// requestAvailableTopics callback to sends request to the unit selected by user to get all the available topics
func (s server) requestAvailableTopics(w http.ResponseWriter, r *http.Request) {

	keys, ok := r.URL.Query()["unit_id"]

	if !ok || len(keys[0]) < 1 {
		log.Println("Url Param 'key' is missing. please define unit_id")
		return
	}

	key := keys[0]

	response, err := s.nc.Request(key+".available_topics", []byte("help"), 2*time.Second)
	if err != nil {
		log.Println("Error making NATS request:", err)
	}
	fmt.Fprintf(w, string(response.Data))
}

// publishSelectedTopics callback, send request to unit to stream the data selected by user
func (s server) publishSelectedTopics(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "can't read body", http.StatusBadRequest)
		return
	}

	var m map[string]interface{}
	json_err := json.Unmarshal(body, &m)
	if json_err != nil {
		fmt.Printf("could not unmarshal json: %s\n", err)
		return
	}

	response, err := s.nc.Request(m["unit_id"].(string)+".publish_topics", []byte(body), 5*time.Second)
	if err != nil {
		log.Println("Error making NATS request:", err)
	}

	fmt.Fprintf(w, "Response: %v\n", string(response.Data))
}

// check server health status
func (s server) healthz(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "OK")
}

func main() {
	//////////////////////////////////////////////// NATS
	var s server
	var err error
	uri := os.Getenv("NATS_URI")
	
	// wait for nats server for atleast 5s
	for i := 0; i < 5; i++ {
		nc, err := nats.Connect(uri)
		if err == nil {
			s.nc = nc
			break
		}

		fmt.Println("Waiting before connecting to NATS at:", uri)
		time.Sleep(1 * time.Second)
	}
	if err != nil {
		log.Fatal("Error establishing connection to NATS:", err)
	}

	fmt.Println("Connected to NATS at:", s.nc.ConnectedUrl())

	//////////////////////////////////////////////// http server
	http.HandleFunc("/requestAvailableTopics", s.requestAvailableTopics)
	http.HandleFunc("/publishSelectedTopics", s.publishSelectedTopics)
	http.HandleFunc("/healthz", s.healthz)

	fmt.Println("Server listening on port 8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
