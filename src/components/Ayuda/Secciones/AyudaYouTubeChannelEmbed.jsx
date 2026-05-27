import React from "react";
import { Box, Card } from "@mui/material";

export default function YouTubeChannelEmbed({ playlistId }) {
  return (
    <Card sx={{ position: "relative", paddingTop: "56.25%" }}>
      <iframe
        src={`https://www.youtube.com/embed/videoseries?list=${playlistId}`}
        title="YouTube Playlist"
        style={{
          border: 0,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </Card>
  );
}
