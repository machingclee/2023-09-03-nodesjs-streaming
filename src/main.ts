import express, { Response, Request } from "express";
import cors from "cors";
import archiver from "archiver";
import { createWriteStream, createReadStream, ReadStream } from "fs";
import multiparty from "multiparty";
import awsS3Util from "./util/awsS3Util";
import streamUtil from "./util/streamUtil";

const app = express();


app.use(cors())

app.get("/download", async (req, res) => {
  const bucketName = "jaems-cicd";
  const objectKey1 = "assets/fonts/FreightTextProMedium-Italic.woff2";
  const objectKey2 = "assets/fonts/FreightTextProMedium-Italic.woff";

  const stream1 = await awsS3Util.getFileStream({ bucketName, objectKey: objectKey1 });
  const stream2 = await awsS3Util.getFileStream({ bucketName, objectKey: objectKey2 });

  const zipStream = streamUtil.getZipStream();

  if (stream1) {
    zipStream.append(stream1, { name: "FreightTextProMedium-Italic.woff2" });
  }
  if (stream2) {
    zipStream.append(stream2, { name: "FreightTextProMedium-Italic.woff" });
  }
  zipStream.finalize()
  zipStream.pipe(res);
  res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
  res.setHeader("Content-Disposition", "attachment; filename=\"zip-file-example.zip\"");
});


app.post("/stream", async (req, res) => {
  const form = new multiparty.Form();
  form.parse(req);
  form.on("part", (inputStream) => {
    try {
      const outputStream = createWriteStream(inputStream.filename);
      inputStream.on("readable", () => {
        let chunk: Buffer
        while ((chunk = inputStream.read()) != null) {
          outputStream.write(chunk);
        }
      });
    }
    catch (e) {
      res.json({ success: false, erroreMessage: JSON.stringify(e) });
    }
  })
});



app.get("/sse", async (req: Request, res: Response) => {
  console.log("connected");
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  });

  let i = 0;
  const responseInterval = setInterval(() => {
    console.log("producing message!");
    res.write('event: message\n');
    res.write(`data: message item ${i}\n`);
    res.write(`id: ${i}\n\n`);
    i++;
  }, 1000);
  req.on("close", () => {
    console.log("user disconnected");
    clearInterval(responseInterval);
  })
})

app.get("/form", async (req: Request, res: Response) => {
  res.send(`
    <form enctype="multipart/form-data" method="post" action="http://localhost:8080/stream">
      <input type="file" name="uplaod-file">
      <button> Upload File </button>
    </form>
  `)
});


const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

