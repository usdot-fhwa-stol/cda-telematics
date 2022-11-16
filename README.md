| Sonar Code Quality |
|--------------------|
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=usdot-fhwa-stol_carma-messenger&metric=alert_status)](https://sonarcloud.io/dashboard?id=usdot-fhwa-stol_carma-messenger) | 

# GitHub Actions Build status
| Carma-streets-bridge | Carma-vehicle-bridge | telematics-cloud-messaging |
|-----|-----|-----|
[![carma-streets-bridge](https://github.com/usdot-fhwa-stol/cda-telematics/actions/workflows/carma-streets-bridge.yml/badge.svg?branch=feature_gha)](https://github.com/usdot-fhwa-stol/cda-telematics/actions/workflows/carma-streets-bridge.yml) | [![carma-vehicle-bridge](https://github.com/usdot-fhwa-stol/cda-telematics/actions/workflows/carma-vehicle-bridge.yml/badge.svg)](https://github.com/usdot-fhwa-stol/cda-telematics/actions/workflows/carma-vehicle-bridge.yml) | [![telematic-cloud-messaging](https://github.com/usdot-fhwa-stol/cda-telematics/actions/workflows/telematic-cloud-messaging.yml/badge.svg)](https://github.com/usdot-fhwa-stol/cda-telematics/actions/workflows/telematic-cloud-messaging.yml)

# DockerHub Release Builds
| Carma streets nats bridge | Carma streets vehicle nats bridge | telematic cloud messaging |
|-----|-----|-----|
[![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/usdotfhwastoldev/carma_street_nats_bridge?label=carma_street_nats_bridge)](https://hub.docker.com/repository/docker/usdotfhwastoldev/carma_street_nats_bridge) | [![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/usdotfhwastoldev/carma_vehicle_nats_bridge?label=carma_vehicle_nats_bridge)](https://hub.docker.com/repository/docker/usdotfhwastoldev/carma_vehicle_nats_bridge) | [![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/usdotfhwastoldev/telematic_cloud_messaging?label=telematic_cloud_messaging)](https://hub.docker.com/repository/docker/usdotfhwastoldev/telematic_cloud_messaging)
# DockerHub Release Candidate Builds
Need to add the build status checks for release candidate builds during first demo release.
# DockerHub Develop Builds
Need to add the build status checks for official release builds during first demo release.

# cda-telematics
This project will create an open-source Module that can be installed on any vehicle (e.g. a CARMA Platform and/or Messenger vehicle, an L0 or L1 production vehicle, etc.) that will collect data about the vehicle and wirelessly send it out in real time for data analysis. The same Module, with any modifications, if necessary, will also be compatible with CARMA Streets and CARMA Cloud. On the receiving end of this data, a user will have a Data Processing & Visualization Tool available to visualize and/or plot the data that was sent using the Module(s). This Module can be thought of as a Fleet Management tool with extra capabilities to support CDA research and education.

## Architecture Diagram
[Detailed Design](https://usdot-carma.atlassian.net/wiki/spaces/WFD2/pages/2230321179/Detailed+System+Design)
  
![architecture](https://user-images.githubusercontent.com/34483068/171265484-67177ebb-69f7-4286-9602-016043079958.png)


## Documentation
Documentation of the setup, operation, and design of the CDA Telematics can be found on the project [Confluence](https://usdot-carma.atlassian.net/wiki/spaces/WFD2/overview) pages. 


## Contribution
Welcome to the CDA Telematics contributing guide. Please read this guide to learn about our development process, how to propose pull requests and improvements, and how to build and test your changes to this project. [CDA Telematics Contributing Guide](Contributing.md) 

## Code of Conduct 
Please read our [CDA Telematics Code of Conduct](Code_of_Conduct.md) which outlines our expectations for participants within the developer community, as well as steps to reporting unacceptable behavior. We are committed to providing a welcoming and inspiring community for all and expect our code of conduct to be honored. Anyone who violates this code of conduct may be banned from the community.

## Attribution
The development team would like to acknowledge the people who have made direct contributions to the design and code in this repository. [CDA Telematics Attribution](ATTRIBUTION.md) 

## License
By contributing to the Federal Highway Administration (FHWA) CDA Telematics repository, you agree that your contributions will be licensed under its Apache License 2.0 license. [CDA Telematics License](<docs/License.md>)

## Contact
Please click on the link below to visit the Federal Highway Adminstration(FHWA) CARMA website. For more information, contact CARMA@dot.gov.

[CARMA Contacts](https://highways.dot.gov/research/research-programs/operations/CARMA)

## Support
For technical support from the CARMA team, please contact the CARMA help desk at CARMASupport@dot.gov.
