package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql"
	_ "github.com/lib/pq"
	"github.com/nats-io/nats.go"
)

type Node struct {
	UnitId    string  `json:"UnitId"`
	UnitType  string  `json:"UnitType"`
	Timestamp float64 `json:"Timestamp"`
	Topics    []struct {
		Name string `json:"name"`
		Type string `json:"type"`
	} `json:"Topics"`
}

type Heartbeat struct {
	Stamp struct {
		Sec     int `json:"sec"`
		Nanosec int `json:"nanosec"`
	} `json:"stamp"`
	Level    int    `json:"level"`
	Name     string `json:"name"`
	Msg      string `json:"msg"`
	File     string `json:"file"`
	Function string `json:"function"`
	Line     int    `json:"line"`
}

type TwistStamped struct {
	Header struct {
		Stamp struct {
			Sec     int `json:"sec"`
			Nanosec int `json:"nanosec"`
		} `json:"stamp"`
		FrameID string `json:"frame_id"`
	} `json:"header"`
	Twist struct {
		Linear struct {
			X float64 `json:"x"`
			Y float64 `json:"y"`
			Z float64 `json:"z"`
		} `json:"linear"`
		Angular struct {
			X float64 `json:"x"`
			Y float64 `json:"y"`
			Z float64 `json:"z"`
		} `json:"angular"`
	} `json:"twist"`
}

func healthz(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "OK")
}

func runforever(nc *nats.Conn, unit_id string) {
	nc.QueueSubscribe(unit_id+".data.>", "data", func(m *nats.Msg) {

		var data map[string]interface{}
		err := json.Unmarshal(m.Data, &data)
		if err != nil {
			fmt.Printf("could not unmarshal json: %s\n", err)
			return
		}

		log.Println(m.Subject, string(m.Data))
	})
}

func MakeRedshfitConnection(username, password, host, port, dbName string) (*sql.DB, error) {

	url := fmt.Sprintf("sslmode=require user=%v password=%v host=%v port=%v dbname=%v",
		username,
		password,
		host,
		port,
		dbName)

	var err error
	var db *sql.DB
	if db, err = sql.Open("postgres", url); err != nil {
		return nil, fmt.Errorf("redshift connect error : (%v)", err)
	}

	if err = db.Ping(); err != nil {
		return nil, fmt.Errorf("redshift ping error : (%v)", err)
	}
	return db, nil
}

func main() {

	// connecting to NATS server
	//

	nats_uri := os.Getenv("NATS_URI")
	var nats_err error
	var nc *nats.Conn
	var db *sql.DB

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

	// connecting to MYSQL server
	//

	mysql_uri := os.Getenv("MYSQL_URI")
	mysql_user := os.Getenv("MYSQL_USER")
	mysql_password := os.Getenv("MYSQL_PASSWORD")
	mysql_database := os.Getenv("MYSQL_DATABASE")

	db_open_statment := mysql_user + ":" + mysql_password + "@tcp(" + mysql_uri + ")" + "/" + mysql_database
	db, err := sql.Open("mysql", db_open_statment)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	for i := 0; i < 5; i++ {
		err = db.Ping()
		if err == nil {
			break
		}

		fmt.Println("Waiting before connecting to MYSQL at:", mysql_uri)
		time.Sleep(5 * time.Second)
	}
	if err != nil {
		log.Fatal("Error establishing connection to MYSQL:", err)
	}

	fmt.Println("Successfully Connected to MYSQL at:", "tcp("+mysql_uri+")"+"/"+mysql_database)

	// connect to redshift

	redshift_db, _ := MakeRedshfitConnection("****", "*****", "*****", "5439", "dev")

	err = redshift_db.Ping()
	if err != nil {
		panic(err)
	}
	fmt.Println("Successfully Connected to redshift at:", "*****")

	// setting up nasts callbacks
	//

	nc.Subscribe("register_node", func(m *nats.Msg) {

		fmt.Println("Received request on:", m.Subject, string(m.Data))

		var n Node
		err := json.Unmarshal([]byte(m.Data), &n)
		if err != nil {
			fmt.Printf("could not unmarshal json: %s\n", err)
			return
		}

		tx, err := db.Begin()
		if err != nil {
			log.Fatal(err)
		}
		defer tx.Rollback()

		stmt, err := tx.Prepare("REPLACE INTO NODES VALUES (?,?,?)")
		if err != nil {
			log.Fatal(err)
		}
		defer stmt.Close()

		_, err = stmt.Exec(n.UnitId, n.UnitType, n.Timestamp)
		if err != nil {
			log.Fatal(err)
		}

		err = tx.Commit()
		if err != nil {
			log.Fatal(err)
		}

		response, _ := json.Marshal(map[string]interface{}{
			"TimeStamp": fmt.Sprint(time.Now().UnixNano() / int64(time.Millisecond)),
			"Status":    http.StatusCreated,
		})

		nc.Publish(m.Reply, []byte(response))
	})

	nc.Subscribe("*.data.>", func(m *nats.Msg) {

		info := strings.Split(m.Subject, ".")

		unit_id := info[0]
		// message_topic := info[2:len(info)]

		var data map[string]interface{}
		err := json.Unmarshal(m.Data, &data)
		if err != nil {
			fmt.Printf("could not unmarshal json: %s\n", err)
			return
		}

		msg_type := data["msg_type"]

		switch msg_type {

		case "rcl_interfaces/msg/Log":
			var h Heartbeat
			err := json.Unmarshal(m.Data, &h)
			if err != nil {
				fmt.Printf("could not unmarshal json: %s\n", err)
				return
			}
			fmt.Println(string("\033[35m"), unit_id, "message delay is", (time.Now().UnixNano() - int64(h.Stamp.Sec*1000000000) - int64(h.Stamp.Nanosec)), "ns")

		case "geometry_msgs/msg/TwistStamped":

			var s TwistStamped
			err := json.Unmarshal(m.Data, &s)
			if err != nil {
				fmt.Printf("could not unmarshal json: %s\n", err)
				return
			}
			stmt, err := redshift_db.Prepare("INSERT INTO TwistStamped(Sec,Nanosec,Linear_x, Linear_y, Linear_z, Angular_x, Angular_y, Angular_z, vehicle_id, message_topic) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);")
			stmt.Exec(s.Header.Stamp.Sec, s.Header.Stamp.Nanosec, s.Twist.Linear.X, s.Twist.Linear.Y, s.Twist.Linear.Z, s.Twist.Angular.X, s.Twist.Angular.Y, s.Twist.Angular.Z, unit_id, m.Subject)
			log.Println(unit_id+" loggged TwistStamped data: ", s)

		default:
			log.Println(msg_type, data)
		}

	})

	fmt.Println("Server listening on port 8181...")

	http.HandleFunc("/healthz", healthz)
	if err := http.ListenAndServe(":8181", nil); err != nil {
		log.Fatal(err)
	}

}
