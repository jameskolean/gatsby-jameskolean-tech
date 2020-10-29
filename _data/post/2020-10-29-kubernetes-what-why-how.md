---
template: BlogPost
date: 2020-10-29
published: true
title: 'Kubernetes ... What, Why, and How'
source: https://gitlab.com/jameskolean/kubernetes-what-why-how
tags:
  - Docker
  - Kubernetes
  - Dev Ops
thumbnail: /assets/server-racks-unsplash.jpg
---

It's finally time to make a few notes on Kubernetes. We have already looked at Docker and Docker Compose, so we can use that knowledge to explore what Kubernetes is. If you want a great YouTube resource to get started, you should check out [Docker and Kubernetes Tutorial](https://www.youtube.com/watch?v=bhBSlnQcq2k). I will be pulling examples from that tutorial. The first two-thirds is all about Docker, and the last third is Kubernetes. It's an excellent introduction tutorial. You should subscribe to [TechWorld with Nana](https://www.youtube.com/channel/UCdngmbVKX1Tgre699-XLlUA) she produces fantastic content.

# What is it?

from kubernetes.io

_Kubernetes is a portable, extensible, open-source platform for managing containerized workloads and services, that facilitates both declarative configuration and automation. It has a large, rapidly growing ecosystem. Kubernetes services, support, and tools are widely available._

Rember how we used Docker Compose to launch multiple Docker instances. For example, we created a Docker Compose file that launched a single web server, connected it to an API server, and connected that to a MongoDB instance? Kubernetes performs a similar function but goes further. Kubernetes also manages scaling and failovers. It does this in a way that abstracts away vendor-specific implementations.

# Why use Kubernetes?

from kubernetes.io

<i>Containers are a good way to bundle and run your applications. In a production environment, you need to manage the containers that run the applications and ensure that there is no downtime. For example, if a container goes down, another container needs to start. Wouldn't it be easier if this behavior was handled by a system?
That's how Kubernetes comes to the rescue! Kubernetes provides you with a framework to run distributed systems resiliently. It takes care of scaling and failover for your application, provides deployment patterns, and more. For example, Kubernetes can easily manage a canary deployment for your system.
Kubernetes provides you with:

- **_Service discovery and load balancing_** Kubernetes can expose a container using the DNS name or using their own IP address. If traffic to a container is high, Kubernetes is able to load balance and distribute the network traffic so that the deployment is stable.
- **_Storage orchestration_** Kubernetes allows you to automatically mount a storage system of your choice, such as local storages, public cloud providers, and more.
- **_Automated rollouts and rollbacks_** You can describe the desired state for your deployed containers using Kubernetes, and it can change the actual state to the desired state at a controlled rate. For example, you can automate Kubernetes to create new containers for your deployment, remove existing containers and adopt all their resources to the new container.
- **_Automatic bin packing_** You provide Kubernetes with a cluster of nodes that it can use to run containerized tasks. You tell Kubernetes how much CPU and memory (RAM) each container needs. Kubernetes can fit containers onto your nodes to make the best use of your resources.
- **_Self-healing_** Kubernetes restarts containers that fail, replaces containers, kills containers that don't respond to your user-defined health check, and doesn't advertise them to clients until they are ready to serve.
- **_Secret and configuration management_** Kubernetes lets you store and manage sensitive information, such as passwords, OAuth tokens, and SSH keys. You can deploy and update secrets and application configuration without rebuilding your container images, and without exposing secrets in your stack configuration.
  </i>

# How to use Kubernetes?

## Create a Kubernetes Cluster

First, we need a Kubernetes Cluster. For local development, we will use [minikube](https://minikube.sigs.k8s.io/docs/start/). Here is how to install it on the macOS. It should also install `kubectl` as a dependency.

```bash
brew update
brew install minikube
minikube
minikube status
minikube start
minikube dashboard
kubectl
```

## Our example

In this example, we will launch a MongoDB and a Mongo Express UI.

Browser -> Mongo-Express -> MongoDB

## Launch MongoDB

To start MongoDB we need to create a [YAML](https://en.wikipedia.org/wiki/YAML) file that tells Kubernetes how to launch a docker instance of MongoDB.

> mongo.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb-deployment
  labels:
    app: mongodb
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
        - name: mongodb
          image: mongo
          ports:
            - containerPort: 27017
          env:
            - name: MONGO_INITDB_ROOT_USERNAME
              valueFrom:
                secretKeyRef:
                  name: mongodb-secret
                  key: mongo-root-username
            - name: MONGO_INITDB_ROOT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mongodb-secret
                  key: mongo-root-password
```

### What going on here?

`kind` is set to `Deployment` because we are deploying a docker instance.
In the `metadata` section, we are naming the deployment and tagging it to match it later.
In the `spec` section, we tell Kubernetes how we want to deploy the docker instance. In this case, we only want a single instance to run, so `replicas` is 1. The `containers` section describes the Docker image and any variables that need to be set (see DockerHub for this information). In our case, we need to set the root username and password. We do this by referencing a Secrets file.

> mongo-secret.yaml

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mongodb-secret
type: Opaque
data:
  mongo-root-username: dXNlcm5hbWU=
  mongo-root-password: cGFzc3dvcmQ=
```

In this case, `kind` is set to `Secret.` The `data` section is a list of key-value pairs where the value is base64 encoded. Note that Base64 is not an encryption tool. It's no more secure than plain text. You can base64 encode a string like this.

```bash
echo -n 'username' | base64
echo -n 'password' | base64
```

### Start it up

```bash
minikube start
kubectl apply -f mongo-secret.yaml
kubectl get secret
kubectl apply -f mongo.yaml
kubectl get all
kubectl get pod
kubectl describe pod <your-pod-id>
kubectl get pod --watch
kubectl get pod -o wide
kubectl get all | grep mongodb
```

### Add an Internal Service

To let other Pods talk to our MongoDB Pod, we need to add a Service. We want to use an Internal Service in this case because we only want other pods to connect. We don't want anyone on the internet poking at our MongoDB. We need another YAML file to do this. Since the Service and the Deployment are tightly coupled, it makes sense to append the Service definition to the Deployment file. It now looks like this.

> mongo.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb-deployment
  labels:
    app: mongodb
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
        - name: mongodb
          image: mongo
          ports:
            - containerPort: 27017
          env:
            - name: MONGO_INITDB_ROOT_USERNAME
              valueFrom:
                secretKeyRef:
                  name: mongodb-secret
                  key: mongo-root-username
            - name: MONGO_INITDB_ROOT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mongodb-secret
                  key: mongo-root-password
---
apiVersion: v1
kind: Service
metadata:
  name: mongodb-service
spec:
  selector:
    app: mongodb
  ports:
    - protocol: TCP
      port: 27017
      targetPort: 27017
```

### Start it up

```bash
kubectl apply -f mongo.yaml
kubectl get service
```

## Launch MongoExpress

We need to do pretty much the same thing.

> mongo-express.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongo-express
  labels:
    app: mongo-express
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongo-express
  template:
    metadata:
      labels:
        app: mongo-express
    spec:
      containers:
        - name: mongo-express
          image: mongo-express
          ports:
            - containerPort: 8081
          env:
            - name: ME_CONFIG_MONGODB_ADMINUSERNAME
              valueFrom:
                secretKeyRef:
                  name: mongodb-secret
                  key: mongo-root-username
            - name: ME_CONFIG_MONGODB_ADMINPASSWORD
              valueFrom:
                secretKeyRef:
                  name: mongodb-secret
                  key: mongo-root-password
            - name: ME_CONFIG_MONGODB_SERVER
              valueFrom:
                configMapKeyRef:
                  name: mongodb-configmap
                  key: database_url
---
apiVersion: v1
kind: Service
metadata:
  name: mongo-express-service
spec:
  selector:
    app: mongo-express
  type: LoadBalancer
  ports:
    - protocol: TCP
      port: 8081
      targetPort: 8081
      nodePort: 30000
```

Notice that we added a ConfigMap for the MongoDB URL.

> mongo-configmap.yaml

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mongodb-configmap
data:
  database_url: mongodb-service
```

The Service also changed. This time the service is of type `LoadBalancer.` making it an external service so we can access it from the browser.

### Start it up

```bash
kubectl apply -f mongo-configmap.yaml
kubectl get configMap
kubectl apply -f mongo-express.yaml
kubectl logs <yout-pod-id>
minikube service mongo-express-service
```

## Ingress Service

The External Service is sufficient for development, but the better solution is to use an Ingress Service.

### Coming soon

## Volumes

Currently, if MongoDB stops all our data is lost. We need a way to persist some data between Pod restarts. This is where Volume come in.

### Coming soon