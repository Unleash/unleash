---
title: "ADR: Handling tables"
---

## Background

We need to handle table state on different pages. Some pages do client side table handling while some other need to offload some work to the server.
Two most critical pages that we migrate to server handling are the Feature Flags page and Project Overview page. 

[Table handling options](/img/handling-tables-adr.png)

Table handling consists of 4 parts:
* API call and **server side data handling**
* persistent table state in URL and localStorage (handled by the usePerisistentTableState hook)
* column definitions and **client side data handling** (handled either by react-table or custom code)
* Material-UI rendering components

Data handling consists of:
* sorting (either server or client side)
* pagination (either server or client side)
* searching (either server or client side)
* filtering (either server or client side)
* column visibility (only client side)
* row selection (only client side)

### Options

For pages with no server data handling we need `react-table` for client side data handling. 
For pages with server data handling we considered two options that we implemented in a spike:
* not using `react-table` and writing minimal custom code for column visibility, data mapping and row selection. 
Not much else is required since server side is doing sorting/pagination/searching/filtering
* using `react-table` with the extra cost of the library magic and writing connectors from backend data to `react-table` structures

The tradeoff is between simplicity of the pages that support server side data handling and the consistency 
between the definitions of the client side and server side powered tables.


## Decision

We have decided to **favor consistency over one-off simplicity**.
Using `react-table` comes at a cost but allows to change between client and server side data handling with lesser effort. It allows to revert decisions to client side and makes the migration 
to server side data handling easier.

