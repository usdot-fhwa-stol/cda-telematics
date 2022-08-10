ARG GO_VERSION=1.18

FROM golang:${GO_VERSION}-alpine

RUN apk update && apk add alpine-sdk git && rm -rf /var/cache/apk/*

RUN mkdir -p /worker
WORKDIR /worker

RUN go mod init telematics.com/telematics
RUN go mod download

COPY . .
RUN go get -d -v ./...

RUN go build -o ./worker worker.go

EXPOSE 8080