const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const csv = require("csv-parser");
const { log } = require("console");

const port = process.env.PORT ? process.env.PORT : 3009;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("node_modules/tw-elements/dist/js"));

app.set("views", "views");
app.set("view engine", "ejs");
async function parseCsv(filePath) {
  try {
    const data = [];
    const csvOptions = {
      mapHeaders: ({ header }) => header.trim().toLowerCase(),
    };

    return new Promise((resolve, reject) => {
      const csvStream = fs.createReadStream(filePath).pipe(csv(csvOptions));

      csvStream.on("data", (row) => {
        // Ignore cells that contain 'หมายเหตุ'
        if (
          row["type"].includes("หมายเหตุ") ||
          row["content"].includes("หมายเหตุ") ||
          row["style"].includes("หมายเหตุ") ||
          row["movement"].includes("หมายเหตุ")
        ) {
          return;
        }

        // Convert fields to lowercase
        const obj = {
          type: row["type"].toLowerCase(),
          content: row["content"],
          style: row["style"].toLowerCase(),
          movement: row["movement"].toLowerCase(),
        };
        data.push(obj);
      });

      csvStream.on("end", () => {
        resolve(data);
      });

      csvStream.on("error", (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error("Error parsing CSV file:", error);
    return [];
  }
}

async function parseCsvPlus(filePath) {
  try {
    const data = {};

    const csvOptions = {
      mapHeaders: ({ header }) => header.trim().toLowerCase(),
    };

    return new Promise((resolve, reject) => {
      const csvStream = fs.createReadStream(filePath).pipe(csv(csvOptions));

      csvStream.on("data", (row) => {
        // Ignore cells that contain 'หมายเหตุ'
        if (
          row["type"].includes("หมายเหตุ") ||
          row["content"].includes("หมายเหตุ") ||
          row["style"].includes("หมายเหตุ") ||
          row["movement"].includes("หมายเหตุ")
        ) {
          return;
        }

        const productName = row["product"].trim();

        // Convert fields to lowercase
        const obj = {
          type: row["type"].toLowerCase(),
          content: row["content"],
          style: row["style"].toLowerCase(),
          movement: row["movement"].toLowerCase(),
        };

        // Check if the productNumber already exists in data
        if (data[productName]) {
          // If yes, append the obj to the existing array
          data[productName].push(obj);
        } else {
          // If no, create a new array with obj
          data[productName] = [obj];
        }
      });

      csvStream.on("end", () => {
        resolve(data);
      });

      csvStream.on("error", (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error("Error parsing CSV file:", error);
    return {};
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Extracting the filename
    const fileName = file.originalname;
    let folder;

    // Determining the folder based on the filename prefix
    if (fileName.startsWith("jetlin")) {
      folder = "jetlin";
    } else if (fileName.startsWith("nongyai")) {
      folder = "nongyai";
    } else if (fileName.startsWith("nantaram")) {
      folder = "nantaram";
    } else if (fileName.startsWith("maeping")) {
      folder = "maeping";
    } else if (fileName.startsWith("phayakam")) {
      folder = "phayakam";
    } else {
      folder = "unknown"; // Or handle other cases as per your requirement
    }

    // Setting the destination folder
    cb(null, `public/resources/${folder}`);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.array("fileInput", 10), (req, res) => {
  console.log("Uploaded files:", req.files);
  res.redirect("/public/beta/update");
});

app.get("/", function (req, res) {
  res.render("pages/index");
});

app.get("/jetlin01", async function (req, res) {
  try {
    const data = await parseCsv("public/resources/jetlin/jetlin01.csv");
    // console.log("Parsed data for /jetlin01:", data);
    res.render("pages/primary", { data });
  } catch (error) {
    console.error("Error processing /jetlin01:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/jetlin02", async function (req, res) {
  try {
    const data = await parseCsv("public/resources/jetlin/jetlin02.csv");
    // console.log("Parsed data for /jetlin02:", data);
    res.render("pages/primary", { data });
  } catch (error) {
    console.error("Error processing /jetlin02:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/jetlin03", async function (req, res) {
  try {
    const data = await parseCsv("public/resources/jetlin/jetlin03.csv");
    // console.log("Parsed data for /jetlin03:", data);
    res.render("pages/primary", { data });
  } catch (error) {
    console.error("Error processing /jetlin03:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/jetlin04", async function (req, res) {
  try {
    const data = await parseCsvPlus("public/resources/jetlin/jetlin04.csv");
    // console.log("Parsed data for /jetlin04:", data);
    res.render("pages/jetlin-product", { data });
  } catch (error) {
    console.error("Error processing /jetlin04:", error);
    res.status(500).send("Internal Server Error");
  }
});

// app.get("/jetlin04/product:id", async function (req, res) {
//   try {
//     const data = await parseCsvPlus("public/resources/jetlin/jetlin04.csv");
//     console.log(`Parsed data for jetlin/product${req.params.id}:`, data);

//     const key = req.params.id;
//     const parseContent = data[key];
//     const current = parseInt(req.query.current) || 1; // Get the current value from the query string

//     // Render the EJS template and pass in the current value
//     res.render("pages/product", { data: parseContent, current: current });
//   } catch (error) {
//     console.error(`Error processing jetlin/product${req.params.id}:`, error);
//     res.status(500).send("Internal Server Error");
//   }
// });

app.get("/maeping01", async function (req, res) {
  try {
    const data = await parseCsv("public/resources/maeping/maeping01.csv");
    // console.log("Parsed data for /jetlin04:", data);
    res.render("pages/primary", { data });
  } catch (error) {
    console.error("Error processing /jetlin04:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/maeping02", async function (req, res) {
  try {
    const data = await parseCsv("public/resources/maeping/maeping02.csv");
    // console.log("Parsed data for /jetlin04:", data);
    res.render("pages/primary", { data });
  } catch (error) {
    console.error("Error processing /jetlin04:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/maeping03", async function (req, res) {
  try {
    const data = await parseCsv("public/resources/maeping/maeping03.csv");
    // console.log("Parsed data for /jetlin04:", data);
    res.render("pages/primary", { data });
  } catch (error) {
    console.error("Error processing /jetlin04:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/maeping04", async function (req, res) {
  try {
    const data = await parseCsv("public/resources/maeping/maeping04.csv");
    // console.log("Parsed data for /jetlin04:", data);
    res.render("pages/primary", { data });
  } catch (error) {
    console.error("Error processing /jetlin04:", error);
    res.status(500).send("Internal Server Error");
  }
});

// app.get("/maeping04/product:id", async function (req, res) {
//   try {
//     const data = await parseCsvPlus("public/resources/maeping/maeping04.csv");
//     console.log(`Parsed data for jetlin/product${req.params.id}:`, data);

//     const key = req.params.id;
//     const parseContent = data[key];
//     const current = parseInt(req.query.current) || 1; // Get the current value from the query string

//     // Render the EJS template and pass in the current value
//     res.render("pages/product", { data: parseContent, current: current });
//   } catch (error) {
//     console.error(`Error processing jetlin/product${req.params.id}:`, error);
//     res.status(500).send("Internal Server Error");
//   }
// });

app.get("/nongyai01", async function (req, res) {
  try {
    const data = await parseCsv("public/resources/nongyai/nongyai01.csv");
    // console.log("Parsed data for /jetlin04:", data);
    res.render("pages/primary", { data });
  } catch (error) {
    console.error("Error processing /jetlin04:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/nongyai02", async function (req, res) {
  try {
    const data = await parseCsv("public/resources/nongyai/nongyai02.csv");
    // console.log("Parsed data for /jetlin04:", data);
    res.render("pages/primary", { data });
  } catch (error) {
    console.error("Error processing /jetlin04:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/nongyai03", async function (req, res) {
  try {
    const data = await parseCsv("public/resources/nongyai/nongyai03.csv");
    // console.log("Parsed data for /jetlin04:", data);
    res.render("pages/primary", { data });
  } catch (error) {
    console.error("Error processing /jetlin04:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/nongyai04", async function (req, res) {
  try {
    const data = await parseCsv("public/resources/nongyai/nongyai04.csv");
    // console.log("Parsed data for /jetlin04:", data);
    res.render("pages/primary", { data });
  } catch (error) {
    console.error("Error processing /jetlin04:", error);
    res.status(500).send("Internal Server Error");
  }
});
// app.get("/nongyai04/product:id", async function (req, res) {
//   try {
//     const data = await parseCsvPlus("public/resources/nongyai/nongyai04.csv");
//     console.log(`Parsed data for jetlin/product${req.params.id}:`, data);

//     const key = req.params.id;
//     const parseContent = data[key];
//     const current = parseInt(req.query.current) || 1; // Get the current value from the query string

//     // Render the EJS template and pass in the current value
//     res.render("pages/product", { data: parseContent, current: current });
//   } catch (error) {
//     console.error(`Error processing jetlin/product${req.params.id}:`, error);
//     res.status(500).send("Internal Server Error");
//   }
// });

app.get("/phayakam01", async function (req, res) {
  try {
    const data = await parseCsv("public/resources/phayakam/phayakam01.csv");
    // console.log("Parsed data for /jetlin04:", data);
    res.render("pages/primary", { data });
  } catch (error) {
    console.error("Error processing /jetlin04:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/phayakam02", async function (req, res) {
  try {
    const data = await parseCsv("public/resources/phayakam/phayakam02.csv");
    // console.log("Parsed data for /jetlin04:", data);
    res.render("pages/primary", { data });
  } catch (error) {
    console.error("Error processing /jetlin04:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/phayakam03", async function (req, res) {
  try {
    const data = await parseCsv("public/resources/phayakam/phayakam03.csv");
    // console.log("Parsed data for /jetlin04:", data);
    res.render("pages/primary", { data });
  } catch (error) {
    console.error("Error processing /jetlin04:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/phayakam04", async function (req, res) {
  try {
    const data = await parseCsv("public/resources/phayakam/phayakam04.csv");
    // console.log("Parsed data for /jetlin04:", data);
    res.render("pages/primary", { data });
  } catch (error) {
    console.error("Error processing /jetlin04:", error);
    res.status(500).send("Internal Server Error");
  }
});

// app.get("/phayakam04/product:id", async function (req, res) {
//   try {
//     const data = await parseCsvPlus("public/resources/phayakam/phayakam04.csv");
//     console.log(`Parsed data for jetlin/product${req.params.id}:`, data);

//     const key = req.params.id;
//     const parseContent = data[key];
//     const current = parseInt(req.query.current) || 1; // Get the current value from the query string

//     // Render the EJS template and pass in the current value
//     res.render("pages/product", { data: parseContent, current: current });
//   } catch (error) {
//     console.error(`Error processing jetlin/product${req.params.id}:`, error);
//     res.status(500).send("Internal Server Error");
//   }
// });

app.get("/nantaram01", async function (req, res) {
  try {
    const data = await parseCsv("public/resources/nantaram/nantaram01.csv");
    // console.log("Parsed data for /jetlin04:", data);
    res.render("pages/primary", { data });
  } catch (error) {
    console.error("Error processing /jetlin04:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/nantaram02", async function (req, res) {
  try {
    const data = await parseCsv("public/resources/nantaram/nantaram02.csv");
    // console.log("Parsed data for /jetlin04:", data);
    res.render("pages/primary", { data });
  } catch (error) {
    console.error("Error processing /jetlin04:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/nantaram03", async function (req, res) {
  try {
    const data = await parseCsv("public/resources/nantaram/nantaram03.csv");
    // console.log("Parsed data for /jetlin04:", data);
    res.render("pages/primary", { data });
  } catch (error) {
    console.error("Error processing /jetlin04:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/nantaram04", async function (req, res) {
  try {
    const data = await parseCsv("public/resources/nantaram/nantaram04.csv");
    // console.log("Parsed data for /jetlin04:", data);
    res.render("pages/primary", { data });
  } catch (error) {
    console.error("Error processing /jetlin04:", error);
    res.status(500).send("Internal Server Error");
  }
});
// app.get("/nantaram04/product:id", async function (req, res) {
//   try {
//     const data = await parseCsvPlus("public/resources/nantaram/nantaram04.csv");
//     console.log(`Parsed data for jetlin/product${req.params.id}:`, data);

//     const key = req.params.id;
//     const parseContent = data[key];
//     const current = parseInt(req.query.current) || 1; // Get the current value from the query string

//     // Render the EJS template and pass in the current value
//     res.render("pages/product", { data: parseContent, current: current });
//   } catch (error) {
//     console.error(`Error processing jetlin/product${req.params.id}:`, error);
//     res.status(500).send("Internal Server Error");
//   }
// });

app.get("/public/beta/space", function (req, res) {
  res.render("pages/space");
});

app.get("/public/beta/lab", function (req, res) {
  res.render("pages/lab");
});

app.get("/public/beta/update", function (req, res) {
  res.render("pages/update");
});

app.get("*", async function (req, res) {
  res.render("pages/page-not-found");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
