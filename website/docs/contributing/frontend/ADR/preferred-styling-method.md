---
title: "ADR: preferred styling method"
---

This document supersedes [ADR: preferred styles import placement](./preferred-styles-import-placement.md)


## Background

In the codebase, we need to have a uniform way of performing style updates.

## Decision

We have decided to move away from using makeStyles as it's currently deprecated from @material/ui, and kept alive with an 
external interop package to maintain compatability with the latest version. The preferred path forward is to use styled components which is
supported natively in @material/ui and sparingly use the sx prop available on all mui components.
