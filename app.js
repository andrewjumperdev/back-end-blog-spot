const express = require('express');
const mongoose = require('./db');
const BlogPost = require('./BlogPost');
const cron = require('node-cron');
const axios = require('axios');

const app = express();
app.use(express.json());

const openaiApiKey = process.env.OPENAI_API_KEY;

// Verificar conexión al inicio
mongoose.connection.once('open', () => {
  console.log('Conexión a la base de datos establecida');

  // Buscar si ya existe algún blog post al inicio
  BlogPost.findOne({}, (err, blogPost) => {
    if (err) {
      console.error('Error al buscar blog post existente:', err);
    } else if (blogPost) {
      console.log('Blog post existente encontrado:', blogPost);
    } else {
      console.log('No se encontraron blog posts existentes.');
    }
  });
});

app.post('/crear-blog-post', async (req, res) => {
  try {
    const { content } = req.body;

    // Utilizar ChatGPT para generar el título
    const response = await axios.post(
      'https://api.openai.com/v1/engines/davinci-codex/completions',
      {
        prompt: `Genera un título atractivo para un blog post sobre ${content}`,
        max_tokens: 50,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
      }
    );

    const title = response.data.choices[0].text.trim();

    const nuevoBlogPost = new BlogPost({ title, content });
    await nuevoBlogPost.save();

    res.status(201).json({ mensaje: 'Blog post creado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el blog post' });
  }
});

// Programar el bot para que se ejecute todos los días a las 12:00 AM
cron.schedule('11 18 * * *', async () => {
  try {
    // Lógica para que el bot cree un nuevo blog post diariamente
    const response = await axios.post(
      'https://api.openai.com/v1/engines/davinci-codex/completions',
      {
        prompt: 'Genera un título y contenido atractivo para un blog post diario',
        max_tokens: 200,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
      }
    );

    const generatedContent = response.data.choices[0].text.trim();
    const [title, content] = generatedContent.split('\n\n');

    const nuevoBlogPostDiario = new BlogPost({ title, content });
    await nuevoBlogPostDiario.save();

    console.log('Blog post diario creado exitosamente.');
  } catch (error) {
    console.error(error);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
