import Message from '../models/Message.js';

export const getMessages = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const messages = await Message.find({ appointment: appointmentId })
      .populate('sender', 'first_name last_name avatar_url')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { receiver_id, appointment_id, content } = req.body;
    
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiver_id,
      appointment: appointment_id,
      content
    });

    const populatedMessage = await message.populate('sender', 'first_name last_name avatar_url');
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    await Message.updateMany(
      { appointment: appointmentId, receiver: req.user._id, is_read: false },
      { $set: { is_read: true } }
    );
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
