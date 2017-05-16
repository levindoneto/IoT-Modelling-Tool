package de.iotmodtool;

/**
 * IoTModel object
 */
public class IoTModel {
    private String name;
    private String content;
    private String type;

    public IoTModel() {}

    public IoTModel(String name, String type, String content) {
        this.name = name;
        this.type = type;
        this.content = content;
    }

    //setter
    public void setType(String type) {
        this.type = type;
    }
    public void setContent(String content) {
        this.content = content;
    }
    public void setName(String name) {
        this.name = name;
    }

    //getter
    public String getType() {
        return type;
    }
    public String getContent() {
        return content;
    }
    public String getName() {
        return name;
    }
}

