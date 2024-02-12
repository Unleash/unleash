---
title: 4. Scale Horizontally. Decouple reading and writing flags.
---

import Figure from '@site/src/components/Figure/Figure.tsx'

Separating the reading and writing of feature flags into distinct APIs is a critical architectural decision for building a scalable and efficient feature flag system, particularly when considering horizontal scaling. This separation provides several benefits:

<Figure caption="Separating reading and writing of the database allows you to horizontally scale out the read APIs (for instance by placing them behind a load balancer) without scaling the write APIs." img="/img/feature-flag-horizontal-scaling.png"/>

1. **Horizontal Scaling**:

   - By separating read and write APIs, you can horizontally scale each component independently. This enables you to add more servers or containers to handle increased traffic for reading feature flags, writing updates, or both, depending on the demand.

2. **Caching Efficiency**:

   - Feature flag systems often rely on caching to improve response times for flag evaluations. Separating read and write APIs allows you to optimize caching strategies independently. For example, you can cache read operations more aggressively to minimize latency during flag evaluations while still ensuring that write operations maintain consistency across the system.

3. **Granular Access Control**:

   - Separation of read and write APIs simplifies access control and permissions management. You can apply different security measures and access controls to the two APIs. This helps ensure that only authorized users or systems can modify feature flags, reducing the risk of accidental or unauthorized changes.

4. **Better Monitoring and Troubleshooting**:

   - Monitoring and troubleshooting become more straightforward when read and write operations are separated. It's easier to track and analyze the performance of each API independently. When issues arise, you can isolate the source of the problem more quickly and apply targeted fixes or optimizations.

5. **Flexibility and Maintenance**:

   - Separation of concerns makes your system more flexible and maintainable. Changes or updates to one API won't directly impact the other, reducing the risk of unintended consequences. This separation allows development teams to work on each API separately, facilitating parallel development and deployment cycles.

6. **Load Balancing**:

   - Load balancing strategies can be tailored to the specific needs of the read and write APIs. You can distribute traffic and resources accordingly to optimize performance and ensure that neither API becomes a bottleneck under heavy loads.
