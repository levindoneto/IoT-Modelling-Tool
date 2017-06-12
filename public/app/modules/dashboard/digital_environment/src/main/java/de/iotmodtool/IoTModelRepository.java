package de.iotmodtool;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface IoTModelRepository extends MongoRepository<IoTModel, String>{

    IoTModel findByName(String name);    // return the IoTModel with the requested name
}
