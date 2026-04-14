import { model, Schema } from "mongoose";
import { IDivision } from "./division.interface";


const divisionSchema = new Schema<IDivision>({
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    thumbnail: { type: String },
    description: { type: String }
}, {
    timestamps: true
})


divisionSchema.pre("save", async function () {
    if (this.isModified("name")) {
        const baseSlug = this.name.toLowerCase().split(" ").join("-")
        let slug = `${baseSlug}-division`

        let counter = 0;
        while (await Division.exists({ slug })) {
            slug = `${baseSlug}-division-${++counter}` // dhaka-division-1
        }

        this.slug = slug;
    }
    // No next() needed — Mongoose awaits the returned Promise
})

divisionSchema.pre("findOneAndUpdate", async function () {
    const division = this.getUpdate() as Partial<IDivision>

    if (division.name) {
        const baseSlug = division.name.toLowerCase().split(" ").join("-")
        let slug = `${baseSlug}-division`

        let counter = 0;
        while (await Division.exists({ slug })) {
            slug = `${baseSlug}-division-${++counter}` // dhaka-division-1
        }

        division.slug = slug
    }

    this.setUpdate(division)
    // No next() needed
})

export const Division = model<IDivision>("Division", divisionSchema)