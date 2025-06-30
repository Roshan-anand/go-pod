import { createSlice } from "@reduxjs/toolkit";

type InitialT = {
  roomID: string | null;
  studioID: string | null;
  host: string | null;
  role: "host" | "guest" | null;
  recordingName: string | null;
  camRecordingKey: string | null;
  screenRecordingKey: string | null;
  isRecording: boolean;
};

const initialState: InitialT = {
  roomID: null,
  studioID: null,
  host: null,
  role: null,
  recordingName: null,
  camRecordingKey: null,
  screenRecordingKey: null,
  isRecording: false,
};

const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setRoomId: (state, action) => {
      state.roomID = action.payload;
    },
    setStudioId: (state, action) => {
      state.studioID = action.payload;
    },
    setPodRole: (state, action) => {
      state.role = action.payload;
    },
    setHost: (state, action) => {
      state.host = action.payload;
    },
    setRecordingName: (state, action) => {
      state.recordingName = action.payload;
    },
    setRecordingKey: (state, action) => {
      const { type, Key } = action.payload;
      if (type === "cam") state.camRecordingKey = Key;
      else state.screenRecordingKey = Key;
    },
    setIsRecording: (state, action) => {
      state.isRecording = action.payload;
    },
  },
});

export const {
  setRoomId,
  setStudioId,
  setPodRole,
  setHost,
  setRecordingName,
  setRecordingKey,
  setIsRecording,
} = UserSlice.actions;
export default UserSlice.reducer;
