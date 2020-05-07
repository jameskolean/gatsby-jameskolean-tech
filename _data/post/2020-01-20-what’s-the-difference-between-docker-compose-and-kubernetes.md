---
template: BlogPost
date: 2020-01-20T14:50:24.358Z
title: What’s the difference between docker compose and kubernetes?
tags:
  - Dev Ops
thumbnail: /assets/different-shoes-unsplash.jpg
published: true
---

Stack Overflow has a concise post on this at[ https://stackoverflow.com/questions/47536536/whats-the-difference-between-docker-compose-and-kubernetes](https://stackoverflow.com/questions/47536536/whats-the-difference-between-docker-compose-and-kubernetes)\
\
It says:

**[Docker](https://www.docker.com/)**:

- Docker is the container technology that allows you to containerize your applications.
- Docker is the core for using other technologies.

**[Docker Compose](https://docs.docker.com/compose/)**

- Docker Compose allows configuring and starting multiple Docker containers.
- Docker Compose is mostly used as a helper when you want to start multiple Docker containers and doesn’t want to start each one separately using `docker run ...`
- Docker Compose is used for starting containers on the **same** host.
- Docker Compose is used **instead of all optional parameters** when building and running a single docker container.

**[Docker Swarm](https://docs.docker.com/engine/swarm/)**

- Docker swarm is for running and connecting containers on **multiple** hosts.
- Docker swarm is a container cluster management and orchestration tool.
- It manages containers running on multiple hosts and does things like scaling, starting a new container when one crashes, networking containers …
- Docker swarm is docker in production.\
  It is the **native** docker **orchestration tool** that is embedded in the Docker Engine.
- The docker swarm file named stack file is very similar to a Docker compose file.

**[Kubernetes](https://kubernetes.io/)**

- Kubernetes is a **container orchestration tool** developed by Google.
- Kubernete’s goal is very similar to that for Docker swarm.

**[Docker Cloud](https://cloud.docker.com/)**

- A [paid](https://cloud.docker.com/pricing/) enterprise docker service that allows you to build and run containers on cloud servers or local servers.
- It provides a Web UI and a central control panel to run and manage containers while providing all the docker features in a user-friendly Web interface.
