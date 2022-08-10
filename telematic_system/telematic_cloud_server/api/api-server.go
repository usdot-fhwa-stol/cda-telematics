package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
	_ "github.com/lib/pq"

	"github.com/nats-io/nats.go"
)

// Node represents
type Node struct {
	UnitId    string  `json:"UnitId"`
	UnitType  string  `json:"UnitType"`
	Timestamp float64 `json:"Timestamp"`
	Topics    []struct {
		Name string `json:"name"`
		Type string `json:"type"`
	} `json:"Topics"`
}

type server struct {
	nc *nats.Conn
	db *sql.DB
}

func GetNodes(db *sql.DB) ([]Node, error) {

	rows, err := db.Query("SELECT * from wfd.NODES")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	var nodes []Node

	for rows.Next() {
		var n Node
		err := rows.Scan(&n.UnitId, &n.UnitType, &n.Timestamp)
		if err != nil {
			log.Fatal(err)
		}
		nodes = append(nodes, n)
		log.Println(n)
	}

	return nodes, err
}

func (s server) getRegisteredUnits(w http.ResponseWriter, r *http.Request) {
	nodes, _ := GetNodes(s.db)
	res, _ := json.Marshal(nodes)
	fmt.Fprintf(w, string(res))
}

func (s server) requestAvailableTopics(w http.ResponseWriter, r *http.Request) {

	keys, ok := r.URL.Query()["UnitId"]

	if !ok || len(keys[0]) < 1 {
		log.Println("Url Param 'key' is missing. please define UnitId")
		return
	}

	key := keys[0]

	response, err := s.nc.Request(key+".available_topics", []byte("help"), 2*time.Second)
	if err != nil {
		log.Println("Error making NATS request:", err)
	}
	fmt.Fprintf(w, string(response.Data))
}

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

	response, err := s.nc.Request(m["UnitId"].(string)+".publish_topics", []byte(body), 5*time.Second)
	if err != nil {
		log.Println("Error making NATS request:", err)
	}

	fmt.Fprintf(w, "Response: %v\n", string(response.Data))
}

func (s server) baseRoot(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "NATS base")
}

func (s server) healthz(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "OK")
}

func main() {

	//////////////////////////////////////////////// NATS

	var s server
	var err error
	uri := os.Getenv("NATS_URI")

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

	//////////////////////////////////////////////// MYSQL

	mysql_uri := os.Getenv("MYSQL_URI")
	mysql_user := os.Getenv("MYSQL_USER")
	mysql_password := os.Getenv("MYSQL_PASSWORD")
	mysql_database := os.Getenv("MYSQL_DATABASE")

	var mysql_err error

	db_open_statment := mysql_user + ":" + mysql_password + "@tcp(" + mysql_uri + ")" + "/" + mysql_database
	db, err := sql.Open("mysql", db_open_statment)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	for i := 0; i < 5; i++ {
		mysql_err = db.Ping()
		if mysql_err == nil {
			s.db = db
			break
		}

		fmt.Println("Waiting before connecting to MYSQL at:", mysql_uri)
		time.Sleep(5 * time.Second)
	}
	if mysql_err != nil {
		log.Fatal("Error establishing connection to MYSQL:", mysql_err)
	}

	fmt.Println("Connected to MYSQL at:", "tcp("+mysql_uri+")"+"/"+mysql_database)

	//////////////////////////////////////////////// http server

	http.HandleFunc("/", s.baseRoot)
	http.HandleFunc("/getRegisteredUnits", s.getRegisteredUnits)
	http.HandleFunc("/requestAvailableTopics", s.requestAvailableTopics)
	http.HandleFunc("/publishSelectedTopics", s.publishSelectedTopics)
	http.HandleFunc("/healthz", s.healthz)

	fmt.Println("Server listening on port 8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
