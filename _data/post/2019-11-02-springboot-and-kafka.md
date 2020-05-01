---
template: BlogPost
date: 2019-11-02T14:03:59.971Z
title: SpringBoot and Kafka
thumbnail: /assets/people-queue-unsplash.jpg
tags:
  - Java
  - Spring Boot
source: https://gitlab.com/jameskolean/springboot-kafka
---

This is a simple tutorial to show how easy it is to get Spring Boot connected to Kafka. The source code can be found [here](https://gitlab.com/jameskolean/springboot-kafka).

Let’s start by getting Kafka running using a docker container. I’ll assume you have Docker installed. Create file docker-compose.yml with this content.

```yaml
version: '3'
services:
  zookeeper:
    image: wurstmeister/zookeeper
  kafka:
    image: wurstmeister/kafka
    ports:
      - '9092:9092'
    environment:
      KAFKA_ADVERTISED_HOST_NAME: localhost
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
```

In the terminal run these command to start ZooKeeper and Kafka. The last starts an interactive producer. Once running you can type a message like: Hello World<Return> to add a message to Kafka. Note: you will need to install Kafka to have access to kafka-console-producer, I suggest using Homebrew to install this `brew install kafka`.

```shell
docker-compose up -d
docker ps
kafka-console-producer --broker-list localhost:9092 --topic test
```

To view the messages open a new terminal and run this command.

```shell
kafka-console-consumer --bootstrap-server localhost:9092 --topic test
```

## SpringBoot

Go to[ spring initializer](https://start.spring.io/) and create a new SpringBoot application with dependencies Web, Kafka, DevTools, and Lombok. Add a controller we can use to publish some messages. Create KafkaController.java.

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.codegreenllc.kafka.services.Producer;

@RestController
public class KafkaController {
    @Autowired
    private Producer producer;

    @PostMapping(value = "/kafka/publish")
    public void sendMessageToKafkaTopic(@RequestParam("message") final String message) {
        producer.sendMessage(message);
    }
}
```

Now create the Publish and Consume services.

```java

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class Producer {
    private static final String TOPIC = "test";
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    public void sendMessage(final String message) {
        log.info(String.format("$$ -> Producing message --> %s", message));
        kafkaTemplate.send(TOPIC, message);
    }
}
```

```java
package com.codegreenllc.kafka.services;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class Consumer {
    @KafkaListener(topics = "test", groupId = "group_id")
    public void consume(final String message) {
        log.info(String.format("$$ -> Consumed Message -> %s", message));
    }
}
Finally we need to set up the application.propert
```

Finally we need to set up the application.properties like this.

```properties
spring.kafka.consumer.bootstrap-servers: localhost:9092
spring.kafka.consumer.group-id: group-id
spring.kafka.consumer.auto-offset-reset: earliest
spring.kafka.consumer.key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
spring.kafka.consumer.value-deserializer: org.apache.kafka.common.serialization.StringDeserializer
spring.kafka.producer.bootstrap-servers: localhost:9092
```

Go ahead and start the app so we can use the publish endpoint to send a message. The simplest way to do this is with Curl (Postman is another great option).

```shell
curl -X POST \
  'http://localhost:8080/kafka/publish?message=Hello%20World' \
  -H 'cache-control: no-cache'

```

The App logs will confirm the message was published and consumed.
