const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost/playground", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB...");
  })
  .catch((err) => {
    console.log("Could not connect to MongoDB...", err);
  });

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 5,
  },
  category: {
    type: String,
    required: true,
    enum: ["web", "mobile", "network"],
  },
  author: String,
  tags: [String],
  date: { type: Date, default: Date.now() }, //Date.now without () is also ok
  isPublished: Boolean,
  price: {
    type: Number,
    //price is required conditionally, it is required only if this course is published
    required: function () {
      //arrow function will not work because arrow functions don't have their own this, they use the this value of the enclosing execution context (video 8-2 1:05)
      return this.isPublished;
    },
    min: 10,
    max: 200,
  },
});

const Course = mongoose.model("Course", courseSchema);

async function createCourse() {
  const course = new Course({
    name: "Redux Course",
    category: "-",
    author: "Mosh Hamedani",
    tags: ["redux", "frontend"],
    isPublished: true,
    price: 15,
  });

  try {
    const savedCourse = await course.save();
    console.log(savedCourse);
  } catch (ex) {
    console.log(ex.message);
  }
}

async function getCourses() {
  const pageNumber = 1;
  const pageSize = 10;

  const courses = await Course.find({ author: "Mosh", isPublished: true })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .sort({ name: 1 })
    .select({ name: 1, tags: 1 });

  console.log(courses);
}

// Update - Approach: Query first  (find by id --> modify properties --> save)
async function updateCourse(id) {
  const course = await Course.findById(id);
  if (!course) return;

  course.author = "Another author";
  course.isPublished = true;

  const result = await course.save();
  console.log(result);
}

// Update - Approach: Update first  (update directly)
async function updateCourse() {
  const result = await Course.update(
    { isPublished: false },
    {
      $set: {
        isPublished: true,
      },
    }
  );

  console.log(result);
}

// Update - Approach: Update first  (update directly and get the updated resource)
async function updateCourse(id) {
  const course = await Course.findByIdAndUpdate(
    id,
    {
      $set: {
        author: "Jason",
        isPublished: true,
      },
    },
    { new: true }
  );

  console.log(course);
}

async function removeCourse(id) {
  // deleteOne
  const result1 = await Course.deleteOne({ _id: id });
  console.log(result1);

  // deleteMany
  const result2 = await Course.deleteMany({ isPublished: false });
  console.log(result2);

  // delete and get the deleted resource
  const course = await Course.findByIdAndRemove(id);
  console.log(course);
}

createCourse();
