---
title: Developer guide
---

## Introduction {#introduction}

This repository contains two main parts. The backend and the frontend of unleash. The backend is a Node.js application that is built using TypeScript. The frontend is a React application that is built using TypeScript. The backend specific code can be found in the `src` lib folder. The frontend specific code can be found in the `frontend` folder.

## Development philosophy

The development philosophy at unleash is centered at delivering high quality software. We do this by following a set of principles that we believe will help us achieve this goal. We believe that these principles will also help us deliver software that is easy to maintain and extend, serving as our north star.

We believe that the following principles will help us achieve our goal of delivering high quality software:

* We test our code always

Software is difficult. Being a software engineer is about acknowledging our limits, and taking every precaution necessary to avoid introducing bugs. We believe that testing is the best way to achieve this. We test our code always, and prefer automation over manual testing.

* We strive to write code that is easy to understand and maintain

We believe code is a language. Written code is a way to communicate intent. It's about explaining to the reader what this code does, in the shortest amount of time possible. As such, writing clean code is supremely important to us. We believe that this contributes to keeping our codebase maintainable, and helps us maintain speed in the long run.

* We think about solutions before comitting

We don't jump to implementation immediately. We think about the problem at hand, and try to examine the impact that this solution may have in a multitude of scenarios. As our product core is open source, we need to balance the solutions and avoid implementations that may be cumbersome for our community. The need to improve our paid offering must never come at the cost of our open source offering.

### Required reading

The following resources should be read before contributing to the project:

* [Clean code javascript](https://github.com/ryanmcdermott/clean-code-javascript)
* [frontend overview](./frontend/overview.md)
* [backend overview](./backend/overview.md)
