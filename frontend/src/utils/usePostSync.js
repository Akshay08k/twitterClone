import { useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000", {
  withCredentials: true,
});

export default function usePostSocketSync({ onNewPost, onPostDeleted }) {
  useEffect(() => {
    if (onNewPost) {
      socket.on("newPost", onNewPost);
    }

    if (onPostDeleted) {
      socket.on("postDeleted", onPostDeleted);
    }

    return () => {
      if (onNewPost) {
        socket.off("newPost", onNewPost);
      }
      if (onPostDeleted) {
        socket.off("postDeleted", onPostDeleted);
      }
    };
  }, [onNewPost, onPostDeleted]);
}
