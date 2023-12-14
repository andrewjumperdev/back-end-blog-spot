const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://aacpariscr:peBhpouTQLoZvreI@cluster0.9tiv7hb.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = mongoose;
