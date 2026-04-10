import { app } from '@/app';
import { createServer } from 'http';
import { initSocket } from '@/socket';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const server = createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});

