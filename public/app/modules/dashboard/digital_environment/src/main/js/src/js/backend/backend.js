import DeviceStore from "../stores/DeviceStore";
import {definitions} from "../constants/definitions";


function clone(object) {
  return JSON.parse(JSON.stringify(object));
}


export function fire_ajax_export(type, content) {
    const params = {
        type: type
    };
    const url = "/modtool/export" + "?" + $.param(params);
    let response = "";

    $.ajax({
            type: "POST",
            contentType: "application/json",
            url: url,
            data: JSON.stringify(content),
            dataType: 'json',
            async: false
    }).always(function(msg) {
      response = msg.responseText;
    });

    return response;
}


export function fire_ajax_import(type, content) {
        let params = {
            type: type
        };
        let contenttype = "";
        switch (type) {
          case "rdfxml":
            contenttype = "application/rdf+xml";
            break;
          case "turtle":
            contenttype = "text/turtle";
          default:
            contenttype = "application/json"

        }
        const url = "/modtool/import" + "?" + $.param(params);

        $.ajax({
            type: "POST",
            contentType: contenttype,
            url: url,
            data: content,
            async: false
        }).done(function(response) {

          let tempObject = {"@context": {}, "@graph": response};
          //
          // response.map((iterDevice) => {
          //   Object.keys(iterDevice).map((iterAttribute) => {
          //     if (iterDevice[iterAttribute].length && typeof iterDevice[iterAttribute] == "object") {
          //       iterDevice[iterAttribute] = iterDevice[iterAttribute][0]
          //
          //       if (iterDevice[iterAttribute]["@value"])
          //         iterDevice[iterAttribute] = iterDevice[iterAttribute]["@value"]
          //     }
          //   });
          // });

          let context = clone(definitions["@context"]);

          let oldResponse = JSON.stringify(response);


          response = response.map((iterDevice) => {
            Object.keys(iterDevice).map((iterAttribute) => {
              if (iterDevice[iterAttribute].length == 1)
                iterDevice[iterAttribute] = iterDevice[iterAttribute][0];

              let tempStoreValue = "";

              if (iterDevice[iterAttribute]["@value"] != null) {
                tempStoreValue = iterDevice[iterAttribute]["@value"].toString();

                delete iterDevice[iterAttribute];
                iterDevice[iterAttribute] = tempStoreValue;
              }

            });

            return iterDevice
          });

          // replace links
          response.map((iterDevice) => {
            Object.keys(context).map((contextKey) => {
                Object.keys(iterDevice).map((oldKey) => {
                // // if entry is a link

                if (typeof iterDevice[oldKey] == "string" && iterDevice[oldKey].includes(context[contextKey])) {
                  // get match
                  const tempString = iterDevice[oldKey].match(/#.+/)[0];
                  // replace entry
                  iterDevice[oldKey] = contextKey + ":" + tempString.slice(1)

                }

                if (iterDevice[oldKey]["@list"] && Array.isArray(iterDevice[oldKey]["@list"])) {
                  iterDevice[oldKey] = iterDevice[oldKey]["@list"].map((iterEntry) => (iterEntry["@value"]));
                }

                if (typeof iterDevice[oldKey] == "object" && !Array.isArray(iterDevice[oldKey])  && iterDevice[oldKey]["@id"].includes(context[contextKey])) {
                  // get match
                  const tempString = iterDevice[oldKey]["@id"].match(/#.+/)[0];
                  // replace entry
                  iterDevice[oldKey]["@id"] = contextKey + ":" + tempString.slice(1)

                }

                // if link is included in oldkey
                if (oldKey.includes(context[contextKey])) {
                  // get match
                  const tempString = oldKey.match(/#.+/)[0];
                  // replace entry
                  iterDevice[contextKey + ":" + tempString.slice(1)] = iterDevice[oldKey]
                  delete iterDevice[oldKey]
                }


              });
            });
          });

          response = {
            "@context": context,
            "@graph": response
          };

          DeviceStore.setModel(response);
        });
    }


export function fire_ajax_save(name, content) {
    const params = {
        name: name,
        type: "json-ld",
    };
    const url = "/modtool/saveModel" + "?" + $.param(params);
    let message = false;
    $.ajax({
        type: "POST",
        contentType : "application/json",
        url: url,
        async: false,
        data: JSON.stringify(content),
        dataType: 'json'
    }).done(function(){
        message = true;
    }).fail(function(){
        message = false;
    });
    
    return message;
}


export function fire_ajax_load(name) {
    const params = {
        name: name
    };
    $.ajax({
        type: "GET",
        url: "/modtool/loadModel" + "?" + $.param(params),
        async: false
    }).done(function (msg) {
        DeviceStore.setModel(JSON.parse(msg));
    });
}

export function fire_ajax_show() {
    let response = "";
    $.ajax({
        type: "GET",
        url: "/modtool/showModel",
        async: false
    }).done(function (msg){
        response = msg;
    });
    return response;
}
