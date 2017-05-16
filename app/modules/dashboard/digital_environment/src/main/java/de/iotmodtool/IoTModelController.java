package de.iotmodtool;

import de.util.Util;
import org.apache.commons.io.IOUtils;
import org.apache.jena.util.FileManager;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URISyntaxException;
import java.nio.file.Paths;
import static org.apache.commons.io.FileUtils.getFile;

@RestController
public class IoTModelController {
    /**
     * Method to save model into a file,
     * used in 'save' action
     * @param content model's content to be saved
     * @param name model's name
     * @param type always "json-ld"
     * @throws IOException FileNotFoundException
     */
    @RequestMapping(path = "/saveModel", method = RequestMethod.POST)
    public void saveModel (@RequestBody String content, @RequestParam("name") String name, 
							@RequestParam("type") String type, Writer responseWriter)
            throws IOException {

        IoTModel model = new IoTModel(name, type, content);

        String outputFile = model.getName() + ".jsonld";
        FileOutputStream out = new FileOutputStream(outputFile);
        out.write(model.getContent().getBytes());
        out.close();
		responseWriter.write("{}");
    }
    /**
     * Method to load model's content on request
     * used in 'load' action
     * @param name to be requested
     * @param responseWriter to return requested model's content
     * @throws IOException FileNotFoundException
     */
    @RequestMapping(path = "/loadModel", method = RequestMethod.GET)
    public void loadModel (@RequestParam("name") String name, Writer responseWriter) throws IOException {

        String inputFile = name.concat(".jsonld");
        InputStream in = FileManager.get().open(inputFile); // open file with an InputStream
        responseWriter.write(IOUtils.toString(in, "UTF-8")); // convert the InputStream to String and write out
    }
    /**
     * Method to show a list of all saved models,
     * used in 'load' action
     * @param responseWriter to return the list
     * @throws IOException FileNotFoundException
     */
    @RequestMapping(path = "/showModel", method = RequestMethod.GET)
    public void showModel (Writer responseWriter) throws IOException {

        // get root directory from the app
        File dir = new File(Paths.get(".").toAbsolutePath().normalize().toString());

        // list all files with extensions ".jsonld"

        File [] files = dir.listFiles(
                (File directory, String name ) -> name.endsWith(".jsonld")
        );

        // show files
        if (files.length > 0) {
            for (File jsonldfile : files) {
                if (!jsonldfile.getName().equals("temp_model_import.jsonld")) {
                    responseWriter.write(jsonldfile.getName() + "\n");
                }
            }
        } else {
            responseWriter.write("NO MODELS FOUND");
        }
    }
    /**
     * Method for 'export' action
     */
    @RequestMapping(path = "/export", method = RequestMethod.POST)
    public @ResponseBody void exportModel (@RequestBody String content, @RequestParam("type") String type,
                                      HttpServletResponse response)
            throws IOException, URISyntaxException {

        // transform model's content
        Util.transformModelTo(type, content);

        // write transformed model into http response
        String format = Util.getFormat(type);
        String rootPath = Paths.get(".").toAbsolutePath().normalize().toString();
        File dir = new File(rootPath);
        File file = getFile(dir, "temp_model_export" + format);
        InputStream in = new FileInputStream(file);

        switch (type) {
            case "json-ld":
                response.setContentType("application/json");
                break;
            case "turtle":
                response.setContentType("text/turtle");
                break;
            case "rdfxml":
                response.setContentType("application/rdf+xml");
                break;
        }
        response.setHeader("Content-Disposition", "attachment; filename=" + file.getName());
        response.setHeader("Content-Length", String.valueOf(file.length()));
        FileCopyUtils.copy(in, response.getOutputStream());
    }
    /**
     * Method for 'import' action
     */
    @RequestMapping(path = "/import", method = RequestMethod.POST)
    public @ResponseBody void importModel (@RequestBody String content, @RequestParam("type") String type,
                                           HttpServletResponse response) throws IOException {
        // transform model's content
        Util.transformModel(type, content);

        // write transformed model into http response
        String rootPath = Paths.get(".").toAbsolutePath().normalize().toString();
        File dir = new File(rootPath);
        File file = getFile(dir, "temp_model_import.jsonld");
        InputStream in = new FileInputStream(file);

        response.setContentType("application/json");
        response.setHeader("Content-Disposition", "attachment; filename=" + file.getName());
        response.setHeader("Content-Length", String.valueOf(file.length()));
        FileCopyUtils.copy(in, response.getOutputStream());
    }
}
