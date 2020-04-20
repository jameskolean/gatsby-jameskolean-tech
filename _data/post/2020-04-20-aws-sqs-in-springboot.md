---
template: BlogPost
date: 2020-04-20T18:59:29.555Z
title: 'AWS SQS in SpringBoot'
thumbnail: /assets/people-stairs-unsplash.jpg
---

Let's see if we can connect a SpringBoot application to Amazon Simple Queue Service (SQS). To get started, go over to the AWS Management console, got to the Services tab, and search for SQS. Once on the SQS page, click the 'Create New Queue' button. Choose a name, select the Standard Queue, and click 'Quick Create.' Great, we have our queue, and now we need to get credentials to connect to it. Go back to the Services tab and search for IAM, click on Users, then 'Add user.' Choose a name and set the Access Type to Programmatic access. The next step is to add a group. Click 'Create group, name it, and assign it 'AmazonSQSFullAccess.' That's it for AWS you can go back to the Simple Queue Service page to monitor the queue.

Now for the SpringBoot side, head over to SpringBoot Initializer and add dependencies for Spring Boot DevTools, Lombok, and Spring Web. We will need a couple of additional dependencies so add theses.

```XML
		<dependency>
			<groupId>org.springframework</groupId>
			<artifactId>spring-jms</artifactId>
		</dependency>

		<dependency>
			<groupId>com.amazonaws</groupId>
			<artifactId>aws-java-sdk</artifactId>
			<version>1.9.6</version>
		</dependency>

		<dependency>
			<groupId>com.amazonaws</groupId>
			<artifactId>amazon-sqs-java-messaging-lib</artifactId>
			<version>1.0.0</version>
			<type>jar</type>
		</dependency>
```

Let's create a simple message to send like this.

```java
package com.codegreenllc.aws.sqs;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class SimpleMessage {
	String name;
	String objetId;
	String value;
}
```

Let's create a simple controller we can use to trigger a message producer.

```java
package com.codegreenllc.aws.sqs;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/")
public class TestController {
	@Autowired
	private SendMessageService sendMessageService;

	@GetMapping()
	public String getAll(@RequestParam final String name, @RequestParam final String value) throws IOException {
		final SimpleMessage simpleMessage = SimpleMessage.builder().name(name).value(value).build();
		sendMessageService.send(simpleMessage);
		return "Message sent.";
	}
}
```

Now let's do some configuration. This file sets up an SQS Client the producer will use to place messages in the queue and sets up the JMS listener we will use to listen for messages.

```java
package com.codegreenllc.aws.sqs;

import javax.jms.Session;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jms.annotation.EnableJms;
import org.springframework.jms.config.DefaultJmsListenerContainerFactory;
import org.springframework.jms.support.destination.DynamicDestinationResolver;

import com.amazon.sqs.javamessaging.SQSConnectionFactory;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.sqs.AmazonSQSClient;

@Configuration
@EnableJms
public class SqsConfiguration {
	@Value("${aws.accessKey}")
	private String awsAccessKey;

	@Value("${aws.region}")
	private String awsRegion;

	@Value("${aws.secretKey}")
	private String awsSecretKey;

	@Bean
	public AmazonSQSClient amazonSQSClient() {
		return new AmazonSQSClient(getAwsCredentials());
	}

	private AWSCredentials getAwsCredentials() {
		return new BasicAWSCredentials(awsAccessKey, awsSecretKey);
	}

	private AWSCredentialsProvider getAwsCredentialsProvider() {
		return new AWSCredentialsProvider() {
			@Override
			public AWSCredentials getCredentials() {
				return getAwsCredentials();
			}

			@Override
			public void refresh() {
			}
		};
	}

	@Bean
	public DefaultJmsListenerContainerFactory jmsListenerContainerFactory() {
		final SQSConnectionFactory connectionFactory = SQSConnectionFactory.builder()
				.withRegion(Region.getRegion(Regions.fromName(awsRegion)))
				.withAWSCredentialsProvider(getAwsCredentialsProvider()).build();
		final DefaultJmsListenerContainerFactory factory = new DefaultJmsListenerContainerFactory();
		factory.setConnectionFactory(connectionFactory);
		factory.setDestinationResolver(new DynamicDestinationResolver());
		factory.setConcurrency("3-10");
		factory.setSessionAcknowledgeMode(Session.CLIENT_ACKNOWLEDGE);
		return factory;
	}
}

```

You will need to edit /src/main/resources/application.properties with values for your queue.

```properties
sqs.url=https://sqs.us-east-1.amazonaws.com/xxx/YOUR-KEY
aws.accessKey=YOUR-KEY
aws.secretKey=YOUR-SECRET
aws.region=us-east-1
```

To send a message, this is all that is needed

```java
package com.codegreenllc.aws.sqs;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.amazonaws.services.sqs.AmazonSQSClient;
import com.amazonaws.services.sqs.model.SendMessageRequest;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class SendMessageService {
	@Autowired
	AmazonSQSClient amazonSQSClient;
	@Autowired
	protected ObjectMapper objectMapper;

	@Value("${sqs.url}")
	private String sqsUrl;

	public void send(final SimpleMessage simpleMessage) throws IOException {
		simpleMessage.setObjetId(UUID.randomUUID().toString());
		amazonSQSClient.sendMessage(new SendMessageRequest(sqsUrl, objectMapper.writeValueAsString(simpleMessage)));
	}
}
```

To listen for messages, this is all that is needed.

```java
package com.codegreenllc.aws.sqs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class JmsListenerService {
	@Autowired
	ObjectMapper objectMapper;

	@JmsListener(destination = "james-queue")
	public void jamesQueueListener(final String requestJson) throws JsonMappingException, JsonProcessingException {
		System.out.println("Got message: " + objectMapper.readValue(requestJson, SimpleMessage.class));
	}
}
```

## Test it

Start the application an open a browser to http://localhost:8080/?name=test&value=123
