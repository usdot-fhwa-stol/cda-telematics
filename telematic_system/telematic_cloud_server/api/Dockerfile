ARG GO_VERSION=1.18

FROM golang:${GO_VERSION}-alpine

RUN apk update && apk add alpine-sdk git && rm -rf /var/cache/apk/*

RUN mkdir -p /api
WORKDIR /api

RUN go mod init telematics.com/telematics
RUN go mod download

COPY . .
RUN go get -d -v ./...

RUN go build -o ./api-server api-server.go

EXPOSE 8080