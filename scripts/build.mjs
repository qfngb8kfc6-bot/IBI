import {cpSync,rmSync,mkdirSync,existsSync} from 'node:fs';
rmSync('dist',{recursive:true,force:true}); mkdirSync('dist'); cpSync('public','dist',{recursive:true});
if(!existsSync('dist/data/companies.json')) throw new Error('Run npm run import:data first');
console.log('Static production build written to dist/');
