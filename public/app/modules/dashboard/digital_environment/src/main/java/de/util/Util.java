package de.util;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RDFFormat;
import java.io.*;
import java.net.URISyntaxException;

/**
 * This class contains methods that are independent from the IoTModel object
 */
public class Util {
    public static String getFormat(String type) {
        String format = null;
        switch (type) {
            case "rdfxml":
                format = ".rdf";
                break;
            case "turtle":
                format = ".ttl";
                break;
            case "json-ld":
                format = ".jsonld";
                break;
        }
        return format;
    }
    /**
     * Method for model transformation
     * from 'json-ld' format into an arbitrary supported format,
     * a fixed data named 'temp_model_export' is used
     * @param type desired format from user
     * @param content of exported file
     */
    public static void transformModelTo(String type, String content) throws URISyntaxException, IOException {
        String format = getFormat(type);

        String outputFile = "temp_model_export" + format; //temporary file for model convert

        Model tempModel = ModelFactory.createDefaultModel();
        InputStream in = new ByteArrayInputStream(content.getBytes());
        tempModel.read(in, null, "json-ld");    // read

        FileOutputStream out = new FileOutputStream(outputFile);
        tempModel.write(out, type); // write to temporary file
        out.close();
    }
    /**
     * Method for model transformation
     * from an arbitrary supported format into 'json-ld' format,
     * a fixed data named 'temp_model_import' is used
     * @param type of user's imported file
     * @param content of imported file
     */
    public static void transformModel (String type, String content) throws IOException {
        String outputFile = "temp_model_import.jsonld";

        Model tempModel = ModelFactory.createDefaultModel();
        InputStream in = new ByteArrayInputStream(content.getBytes());
        tempModel.read(in, null, type);

        FileOutputStream out = new FileOutputStream(outputFile);

        RDFDataMgr.write(out, tempModel, RDFFormat.JSONLD_EXPAND_PRETTY);

        out.close();
    }
}
