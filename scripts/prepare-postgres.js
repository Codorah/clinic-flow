import fs from 'fs';
import path from 'path';

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Replace sqlite with postgresql
schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Successfully switched Prisma provider to postgresql for production.');
