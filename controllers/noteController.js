import Note from "../models/noteModel.js";
import asyncHandler from "express-async-handler";

// @desc    Get logged in user notes
// @route   GET /api/notes
// @access  Private
const getNotes = asyncHandler(async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id });
    res.json({ success: true, notes });
  } catch (error) {
    con
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

//@description     Fetch single Note
//@route           GET /api/notes/:id
//@access          Public
const getNoteById = asyncHandler(async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (note) {
      res.json({ success: true, note });
    }
    else {
      res.status(404).json({ success: false, message: 'Note note found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

//@description     Create single Note
//@route           GET /api/notes/create
//@access          Private
const CreateNote = asyncHandler(async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      res.status(400).json({ success: false, message: 'Please include all the fields' });
    }
    else {
      const note = new Note({
        user: req.user._id,
        title,
        content,
        category
      });
      const createdNote = await note.save();
      res.status(201).json({ success: true, createdNote });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

//@description     Delete single Note
//@route           GET /api/notes/:id
//@access          Private
const DeleteNote = asyncHandler(async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (note.user.toString() !== req.user._id.toString()) {
      res.status(401).json({ success: false, message: 'You can not perform this action' });
    }

    if (note) {
      await note.remove();
      res.json({ success: true, message: "Note Removed" });
    } else {
      res.status(404).json({ success: false, message: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const UpdateNote = asyncHandler(async (req, res) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content || !category) {
      res.status(400).json({ success: false, message: 'Please fill all the details' });
    }

    const note = await Note.findById(req.params.id);

    if (note.user.toString() !== req.user._id.toString()) {
      res.status(401).json({ success: false, message: 'You can not perform this action' });
    }

    if (note) {
      note.title = title;
      note.content = content;
      note.category = category;

      const updatedNote = await note.save();
      res.json({ success: true, updatedNote });
    } else {
      res.status(404).json({ success: false, message: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export { getNoteById, getNotes, CreateNote, DeleteNote, UpdateNote };