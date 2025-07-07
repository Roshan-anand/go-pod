import { createSlice } from "@reduxjs/toolkit";

type InitialT = {
  roomID: string | null;
  studioID: string | null;
  hostName: string | null;
  hostEmail: string | null;
  role: "host" | "guest" | null;
  recordingName: string | null;
  isRecording: boolean;
};

const initialState: InitialT = {
  roomID: null,
  studioID: null,
  hostName: null,
  hostEmail: null,
  role: null,
  recordingName: null,
  isRecording: false,
};

const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setRoomDetails: (state, action) => {
      const { roomID, name, email, recName } = action.payload;
      state.roomID = roomID;
      state.hostName = name;
      state.hostEmail = email;
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
