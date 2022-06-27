package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nats-io/nats.go"
)

type Node struct {
	ID     string `json:"id"`
	Topics []struct {
		Name string `json:"name"`
		Type string `json:"type"`
	} `json:"topics"`
}

type Nodes struct {
	nodes map[string]Node `json:"nodes"`
}

func nats_connection(wg *sync.WaitGroup, nc *nats.Conn, nodes Nodes) {

	defer wg.Done()

	ch := make(chan *nats.Msg, 1028)
	sub, _ := nc.ChanSubscribe("register_node", ch)

	// handle err
	for msg := range ch {

		// fmt.Printf("map: %v\n", string(msg.Data))

		var n Node
		err := json.Unmarshal([]byte(msg.Data), &n)
		if err != nil {
			fmt.Printf("could not unmarshal json: %s\n", err)
			return
		}
		nodes.nodes[n.ID] = n
	}
	// Unsubscribe if needed
	sub.Unsubscribe()
	close(ch)
}

func server(wg *sync.WaitGroup, nc *nats.Conn, nodes Nodes) {

	defer wg.Done()

	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		fmt.Printf("map: %v\n", nodes)
		c.JSON(http.StatusOK, nodes.nodes)
	})

	r.POST("/post", func(c *gin.Context) {

		jsonData, err := c.GetRawData()
		if err != nil {
			//Handle Error
		}

		fmt.Printf("map: %v\n", string(jsonData))

		pattern := make(map[string]interface{}) // note the content accepted by the structure
		// c.BindJSON(&pattern)
		// log.Printf("%v", &pattern)

		err = json.Unmarshal([]byte(jsonData), &pattern)
		if err != nil {
			fmt.Printf("could not unmarshal json: %s\n", err)
			return
		}

		id := fmt.Sprintf("%v", pattern["id"])

		// Requests
		nc.Request(id, []byte(jsonData), 10*time.Millisecond)

		c.JSON(200, "json")
	})

	r.Run(":9000")
}

func main() {

	nc, _ := nats.Connect(nats.DefaultURL)

	var wg sync.WaitGroup

	var nodes Nodes

	nodes.nodes = make(map[string]Node)

	wg.Add(2)
	go nats_connection(&wg, nc, nodes)
	go server(&wg, nc, nodes)

	fmt.Println("Waiting for goroutines to finish...")
	wg.Wait()
	fmt.Println("Done!")

}
