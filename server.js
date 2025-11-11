import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/live", async (req, res) => {
  const { YT_KEY, CHANNEL_ID } = process.env;

  try {
    // Buscar transmisiones en vivo
    const liveRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${YT_KEY}`
    );
    const liveData = await liveRes.json();

    if (liveData.items && liveData.items.length > 0) {
      const liveVideoId = liveData.items[0].id.videoId;
      return res.json({ live: true, videoId: liveVideoId });
    }

    // Si no hay transmisión, buscar el último video subido
    const uploadsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=date&type=video&maxResults=1&key=${YT_KEY}`
    );
    const uploadsData = await uploadsRes.json();

    if (uploadsData.items && uploadsData.items.length > 0) {
      const lastVideoId = uploadsData.items[0].id.videoId;
      return res.json({ live: false, videoId: lastVideoId });
    }

    res.json({ live: false, videoId: null });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al obtener datos de YouTube" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
