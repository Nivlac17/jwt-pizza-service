# JWT Pizza Penetration Testing Report

## Both peers names
### Calvin Merrell

### Spencer Peart



## Self attack
### Calvin: Create an attack record for each attack.

#### Intruder Brute force Password Attack Record

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 09, 2026                                                                 |
| Target         | pizza.linesoflight.click                                                       |
| Classification | Injection                                                                      |
| Severity       | 1                                                                              |
| Description    | Submitted a login request with a blank password. The server returned HTTP 200 and issued a valid auth token, indicating an authentication bypass for accounts with empty-password acceptance or improper password validation.                |
| Images         | ![Dead database](./screenshots/BruteForce.png) <br/> Stores and menu no longer accessible. |
| Corrections    | Reject blank passwords server-side                                                          |



#### Sequence Auth Token Comparison Attack Record

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 09, 2026                                                                 |
| Target         | pizza.linesoflight.click                                                       |
| Classification | Cryptographic Failures                                                         |
| Severity       | 0                                                                              |
| Description    | Collected hundreds of Authtokens, and compared them for patterns. None found.  |
| Images         | ![Dead database](./screenshots/sequencerToken.png)                             |
| Corrections    | N/A attack failed.                                                             |



#### Injecting Personal Prices Attack Record

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 09, 2026                                                                 |
| Target         | pizza.linesoflight.click                                                       |
| Classification | Injection                                                                      |
| Severity       | 1                                                                              |
| Description    | Injection of User Prices with cost 0 and negative Numbers returned successful purchase of actual price rather than injected price.                |
| Images         | ![Dead database](./screenshots/intuderChangePrice.png) <br/> Succesful token purchase with correct price. |
| Corrections    | N/A attack failed.                                                             |


#### Diner Accessing Admin Tools Attack Record

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 09, 2026                                                                 |
| Target         | pizza.linesoflight.click                                                       |
| Classification | Injection                                                                      |
| Severity       | 0                                                                              |
| Description    | Diner attempting to delete franchises and stores without admin. Attack Failed. |
| Images         | ![Dead database](./screenshots/DinerDeleteStore.png) <br/> Stores and menu no longer accessible. |
| Corrections    | N/A attack failed.                                                             |



#### Attack Record

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 09, 2026                                                                 |
| Target         | pizza.linesoflight.click                                                       |
| Classification | Sensitive Information Exposure / Security Misconfiguration                                                                      |
| Severity       | 1                                                                              |
| Description    | Sent authenticated API requests with missing and malformed bearer tokens using Burp Repeater. The application exposed framework details through response headers. This exposed a zero error that allows any zero auth token bearrer to gain franchine information.
| Images         | ![Dead database](./screenshots/RepeaaterFranchiseInfo.png) <br/> Stores and menu no longer accessible. |
| Corrections    | Sanitize user inputs.                                                          |













### Peer 2: Create an attack record for each attack.

#### Attack Record

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 09, 2026                                                                 |
| Target         | pizza.spencerpeart.uk                                                          |
| Classification | Injection                                                                      |
| Severity       | 1                                                                              |
| Description    | SQL injection deleted database. All application data destroyed.                |
| Images         | ![Dead database](deadDatabase.png) <br/> Stores and menu no longer accessible. |
| Corrections    | Sanitize user inputs.                                                          |



#### Attack Record

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 09, 2026                                                                 |
| Target         | pizza.spencerpeart.uk                                                          |
| Classification | Injection                                                                      |
| Severity       | 1                                                                              |
| Description    | SQL injection deleted database. All application data destroyed.                |
| Images         | ![Dead database](deadDatabase.png) <br/> Stores and menu no longer accessible. |
| Corrections    | Sanitize user inputs.                                                          |



#### Attack Record

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 09, 2026                                                                 |
| Target         | pizza.spencerpeart.uk                                                          |
| Classification | Injection                                                                      |
| Severity       | 1                                                                              |
| Description    | SQL injection deleted database. All application data destroyed.                |
| Images         | ![Dead database](deadDatabase.png) <br/> Stores and menu no longer accessible. |
| Corrections    | Sanitize user inputs.                                                          |


#### Attack Record

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 09, 2026                                                                 |
| Target         | pizza.spencerpeart.uk                                                          |
| Classification | Injection                                                                      |
| Severity       | 1                                                                              |
| Description    | SQL injection deleted database. All application data destroyed.                |
| Images         | ![Dead database](deadDatabase.png) <br/> Stores and menu no longer accessible. |
| Corrections    | Sanitize user inputs.                                                          |



#### Attack Record

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 09, 2026                                                                 |
| Target         | pizza.spencerpeart.uk                                                          |
| Classification | Injection                                                                      |
| Severity       | 1                                                                              |
| Description    | SQL injection deleted database. All application data destroyed.                |
| Images         | ![Dead database](deadDatabase.png) <br/> Stores and menu no longer accessible. |
| Corrections    | Sanitize user inputs.                                                          |














## Peer attack

### Peer 1 attack on peer 2: Create an attack record for each attack.
#### Attack Record

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 09, 2026                                                                 |
| Target         | pizza.spencerpeart.uk                                                          |
| Classification | Injection                                                                      |
| Severity       | 1                                                                              |
| Description    | SQL injection deleted database. All application data destroyed.                |
| Images         | ![Dead database](deadDatabase.png) <br/> Stores and menu no longer accessible. |
| Corrections    | Sanitize user inputs.                                                          |



#### Attack Record

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 09, 2026                                                                 |
| Target         | pizza.spencerpeart.uk                                                          |
| Classification | Injection                                                                      |
| Severity       | 1                                                                              |
| Description    | SQL injection deleted database. All application data destroyed.                |
| Images         | ![Dead database](deadDatabase.png) <br/> Stores and menu no longer accessible. |
| Corrections    | Sanitize user inputs.                                                          |



#### Attack Record

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 09, 2026                                                                 |
| Target         | pizza.spencerpeart.uk                                                          |
| Classification | Injection                                                                      |
| Severity       | 1                                                                              |
| Description    | SQL injection deleted database. All application data destroyed.                |
| Images         | ![Dead database](deadDatabase.png) <br/> Stores and menu no longer accessible. |
| Corrections    | Sanitize user inputs.                                                          |


#### Attack Record

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 09, 2026                                                                 |
| Target         | pizza.spencerpeart.uk                                                          |
| Classification | Injection                                                                      |
| Severity       | 1                                                                              |
| Description    | SQL injection deleted database. All application data destroyed.                |
| Images         | ![Dead database](deadDatabase.png) <br/> Stores and menu no longer accessible. |
| Corrections    | Sanitize user inputs.                                                          |



#### Attack Record

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 09, 2026                                                                 |
| Target         | pizza.spencerpeart.uk                                                          |
| Classification | Injection                                                                      |
| Severity       | 1                                                                              |
| Description    | SQL injection deleted database. All application data destroyed.                |
| Images         | ![Dead database](deadDatabase.png) <br/> Stores and menu no longer accessible. |
| Corrections    | Sanitize user inputs.                                                          |












### Peer 2 attack on peer 1: Create an attack record for each attack.
#### Attack Record

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 09, 2026                                                                 |
| Target         | pizza.linesoflight.click                                                       |
| Classification | Injection                                                                      |
| Severity       | 1                                                                              |
| Description    | SQL injection deleted database. All application data destroyed.                |
| Images         | ![Dead database](deadDatabase.png) <br/> Stores and menu no longer accessible. |
| Corrections    | Sanitize user inputs.                                                          |



#### Attack Record

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 09, 2026                                                                 |
| Target         | pizza.linesoflight.click                                                       |
| Classification | Injection                                                                      |
| Severity       | 1                                                                              |
| Description    | SQL injection deleted database. All application data destroyed.                |
| Images         | ![Dead database](deadDatabase.png) <br/> Stores and menu no longer accessible. |
| Corrections    | Sanitize user inputs.                                                          |



#### Attack Record

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 09, 2026                                                                 |
| Target         | pizza.linesoflight.click                                                       |
| Classification | Injection                                                                      |
| Severity       | 1                                                                              |
| Description    | SQL injection deleted database. All application data destroyed.                |
| Images         | ![Dead database](deadDatabase.png) <br/> Stores and menu no longer accessible. |
| Corrections    | Sanitize user inputs.                                                          |


#### Attack Record

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 09, 2026                                                                 |
| Target         | pizza.linesoflight.click                                                       |
| Classification | Injection                                                                      |
| Severity       | 1                                                                              |
| Description    | SQL injection deleted database. All application data destroyed.                |
| Images         | ![Dead database](deadDatabase.png) <br/> Stores and menu no longer accessible. |
| Corrections    | Sanitize user inputs.                                                          |



#### Attack Record

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 09, 2026                                                                 |
| Target         | pizza.linesoflight.click                                                       |
| Classification | Injection                                                                      |
| Severity       | 1                                                                              |
| Description    | SQL injection deleted database. All application data destroyed.                |
| Images         | ![Dead database](deadDatabase.png) <br/> Stores and menu no longer accessible. |
| Corrections    | Sanitize user inputs.                                                          |



## Combined summary of learnings
This is a very good and important summary
