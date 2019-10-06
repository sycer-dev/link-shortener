import { Document, Schema, model } from 'mongoose';

export interface Link extends Document {
	short: string;
	long: string;
	visits: number;
	createdAt: Date;
}

const Link: Schema = new Schema({
	short: String,
	long: String,
	visits: {
		type: Number,
		default: 0
	},
	createdAt: {
		type: Date,
		default: new Date()
	}
}, {
	strict: false
});

export default model<Link>('Link', Link);
