ARG GO_VERSION=1.18

FROM golang:${GO_VERSION}-alpine AS builder

RUN apk update && apk add alpine-sdk git && rm -rf /var/cache/apk/*

RUN mkdir -p /api
WORKDIR /api

RUN go mod init telematics.com/telematics
RUN go mod download

COPY . .
RUN cd src/ && go get -d -v ./...

COPY . .
RUN go build -o ./app ./src/main.go

FROM alpine:latest

RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*

RUN mkdir -p /api
WORKDIR /api
COPY --from=builder /api/app .

EXPOSE 9000

ENTRYPOINT ["./app"]

