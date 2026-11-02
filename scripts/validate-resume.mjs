import {readFile} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const schemaBytes = await readFile(resolve(root, 'schemas/json-resume.schema.json'));
const schema = JSON.parse(schemaBytes);
const resumeText = await readFile(resolve(root, 'public/resume.json'), 'utf8');
const resume = JSON.parse(resumeText);
const ajv = new Ajv({allErrors: true, strict: false});
addFormats(ajv);
const validate = ajv.compile(schema);
if (!validate(resume)) {
  console.error(JSON.stringify(validate.errors, null, 2)); process.exitCode = 1;
} else {
  if (resume.projects.length !== 15) throw new Error('Expected 15 selected case studies.');
  if (/aurabones/i.test(resumeText)) throw new Error('Removed project found in public data.');
  if (/[A-Z]:[\\/]|\\Users\\|\/Users\//.test(resumeText)) throw new Error('Local path found in public data.');
  if (resume.basics.phone) throw new Error('Private phone must not be published.');
  const text = JSON.stringify(resume.projects);
  if (!text.includes('less than 7% answer error')) throw new Error('Corrected answer-error gate is missing.');
  console.log(JSON.stringify({valid: true, schemaSource: resume.$schema, schemaSha256: createHash('sha256').update(schemaBytes).digest('hex'), projects: resume.projects.length, bytes: Buffer.byteLength(resumeText)}));
}
