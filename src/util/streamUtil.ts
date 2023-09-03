import archiver from "archiver";

const getZipStream = () => {
  const archive = archiver("zip", {
    zlib: { level: 9 }
  });
  return archive;
}

export default {
  getZipStream
}