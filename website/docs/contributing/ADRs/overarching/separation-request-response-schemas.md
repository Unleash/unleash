---
title: "ADR: Separation of request and response schemas"
---

## Background

During the updating of our OpenAPI documentation, we have encountered issues related to the scope and strictness of our schemas for requests and responses. Currently, we are reusing the same schema for both request and response, which has led to situations where the schemas are either too broad for a response or too strict for a request. This has caused difficulties in accurately defining the expected data structures for API interactions.

## Decision

After careful consideration and discussion, it has been decided to separate the request and response schemas to address the challenges we have encountered. By creating distinct schemas for requests and responses, we aim to improve the flexibility and precision of our API documentation.

### Advantages

Separating the schemas will allow us to establish more precise and constrained response types while enabling more forgiving request types. This approach will facilitate better alignment between the expected data structures and the actual data transmitted in API interactions.

The separation of request and response schemas will provide the following benefits:

1. **Enhanced clarity and correctness**: With dedicated schemas for requests and responses, we can define the precise structure and constraints for each interaction. This will help prevent situations where the schemas are overly permissive or restrictive, reducing ambiguity and ensuring that the code handling the requests and responses is more reliable and easier to understand. By separating the schemas, we can define specific and precise structures for requests and responses, minimizing the use of undefined values and improving the overall correctness of the codebase and API implementation. The client knows exactly what data to send in the requests, and the server knows what to expect in the responses, ensuring that both parties are aligned in terms of data structures and expectations.

2. **Improved maintainability**: By avoiding the reuse of schemas between requests and responses, we can modify and update them independently. This decoupling of schemas will simplify maintenance efforts and minimize the risk of unintended side effects caused by changes in one context affecting the other.

3. **Flexibility for future enhancements**: Separating request and response schemas lays the foundation for introducing additional validation or transformation logic specific to each type of interaction. This modularity will enable us to incorporate future enhancements, such as custom validation rules or middleware, with ease.

### Concerns

While this decision brings several benefits, we acknowledge the following concerns that may arise from the separation of request and response schemas:

1. **Increased schema maintenance**: By having separate schemas for requests and responses, there will be a need to maintain and update two sets of schemas instead of a single shared schema. This could potentially increase the maintenance overhead and introduce the possibility of inconsistencies between the two schemas.

2. **Data duplication and redundancy**: With the separation of schemas, there might be instances where certain data fields or structures are duplicated between the request and response schemas. This redundancy could lead to code duplication and increase the risk of inconsistencies if changes are not carefully synchronized between the two schemas.


## Conclusion

By implementing the separation of request and response schemas, we aim to improve the robustness and maintainability of our API documentation. This decision will empower developers to build more reliable integrations by providing clearer guidelines for both request and response data structures.

Furthermore, this separation of schemas brings valuable benefits to our internal development process. It allows us to write more robust code and reduces the need for extensive manipulation of incoming requests to fit the correct shapes. By clearly defining the structure and constraints for each interaction, we minimize the likelihood of bugs and make the code significantly easier to reason about and work with.

While a big bang migration replacing all schemas at once is not feasible, we will follow the Boy Scout Rule and aim to complete the migration to separated schemas by the release of version 6.0. This means that as developers make changes or additions to the code, they will incorporate the separation of schemas, gradually updating the existing codebase over time. This approach ensures a smooth transition to the separated schemas, allowing us to continually improve the code handling requests and responses, reducing reliance on undefined values and promoting clarity, correctness, and maintainability throughout the development process.

Overall, this approach will facilitate better communication, reduce confusion, and enhance the overall developer experience when interacting with our APIs, while providing the aforementioned benefits of more robust code, correctness and improved maintainability.
