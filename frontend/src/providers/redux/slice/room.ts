import { createSlice } from "@reduxjs/toolkit";

type InitialT = {
  roomID: string | null;
  studioID: string | null;
  host: string | null;
  role: "host" | "guest" | null;
  recordingName: string | null;
  isRecording: boolean;
};

const initialState: InitialT = {
  roomID: null,
  studioID: null,
  host: null,
  role: null,
  recordingName: null,
  isRecording: false,
};

const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setRoomDetails: (state, action) => {
      const { roomID, host, recName } = action.payload;
      state.roomID = roomID;
      state.host = host;
      state.recordingName = recName;
    },
    setStudioId: (state, action) => {
      state.studioID = action.payload;
    },
    setPodRole: (state, action) => {
      state.role = action.payload;
    },
    setIsRecording: (state, action) => {
      state.isRecording = action.payload;
    },
  },
});

export const {
  setRoomDetails,
  setStudioId,
  setPodRole,
  setIsRecording,
} = UserSlice.actions;
export default UserSlice.reducer;
