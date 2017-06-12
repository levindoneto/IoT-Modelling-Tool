package de.iotmodtool;

import de.util.Util;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URISyntaxException;
import java.nio.file.Paths;

import static org.apache.commons.io.FileUtils.getFile;

@RestController
public class IoTModelController {

    @Autowired
    private IoTModelRepository repository;

    /**
     * Method to save model into a file,
     * used in 'save' action
     * @param content model's content to be saved
     * @param name model's name
     * @param type always "json-ld"
     * @throws IOException FileNotFoundException
     */
    @RequestMapping(path = "**/saveModel", method = RequestMethod.POST)
    public void saveModel (@RequestBody String content, @RequestParam("name") String name,
							@RequestParam("type") String type, Writer responseWriter)
            throws IOException {
        if (repository.findAll().isEmpty()) {   // insert first model
            repository.insert(new IoTModel(name, type, content));
            responseWriter.write("{}");
        } else {    // iterate through the repository and compare the requested name with every model's name
            int count = 0;
            for (IoTModel model: repository.findAll()) {
                if (!model.getName().equals(name))    // if not match, increase count and continue iterating
                    count = count + 1;
                else    // match, existed model found
                    break;
            }
            if (repository.count() == count) {      // insert new model
                repository.insert(new IoTModel(name, type, content));
                responseWriter.write("{}");
            } else {                                // update model
                repository.save(new IoTModel(repository.findByName(name).id, name, type, content));
                responseWriter.write("{}");
            }
        }
        //responseWriter.write("A model is already existed with the same name!");
        //responseWriter.write("{}");
    }

    @RequestMapping(path = "**/overwriteModel", method = RequestMethod.POST)
    public void overwriteModel (@RequestBody String content, @RequestParam("name") String name,
                           @RequestParam("type") String type, Writer responseWriter)
            throws IOException {
        repository.save(new IoTModel(name, type, content));
        responseWriter.write("{}");
    }
    /**
     * Method to load model's content on request
     * used in 'load' action
     * @param name to be requested
     * @param responseWriter to return requested model's content
     * @throws IOException FileNotFoundException
     */
    @RequestMapping(path = "**/loadModel", method = RequestMethod.GET)
    public void loadModel (@RequestParam("name") String name, Writer responseWriter) throws IOException {

        IoTModel model = repository.findByName(name);
        responseWriter.write(model.getContent());
    }
    /**
     * Method to show a list of all saved models,
     * used in 'load' action
     * @param responseWriter to return the list
     * @throws IOException FileNotFoundException
     */
    @RequestMapping(path = "**/showModel", method = RequestMethod.GET)
    public void showModel (Writer responseWriter) throws IOException {
        if (!repository.findAll().isEmpty()) {
            for (IoTModel model : repository.findAll()) {
                responseWriter.write(model.getName() + Util.getFormat(model.getType()) + "\n");
            }
        } else
            responseWriter.write("NO MODELS FOUND.");
    }

    /**
     * Methode for 'delete' action
     */
    @RequestMapping(path = "**/deleteModel", method = RequestMethod.GET)
    public void deleteModel (@RequestParam String name, Writer responseWriter) throws IOException {
        IoTModel model = repository.findByName(name);
        repository.delete(model.id);
        responseWriter.write("Deleted!");
    }
    /**
     * Method for 'export' action
     */
    @RequestMapping(path = "**/export", method = RequestMethod.POST)
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
    @RequestMapping(path = "**/import", method = RequestMethod.POST)
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
