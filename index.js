require("dotenv").config();

const express=require("express");
const bodyParser=require("body-parser");
const mongoose = require('mongoose');

//databse
const database=require("./database/database");
//Models
const BookModel=require("./database/books");
const AuthorModel=require("./database/author");
const PublicationModel=require("./database/publication");

//INITIALISE express
const booky=express();

booky.use(bodyParser.urlencoded({extended:true}));
booky.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URL,
).then(()=> console.log("DB connection established"));

/*
Route            /
Description      Get all the books
Access           PUBLIC
Parameter        NONE
Methods          GET
*/
booky.get("/",async (req,res)=>{
    const getAllBooks=await BookModel.find()
    return res.json(getAllBooks);
});


/*
Route            /is
Description      Get specific book usig isbn
Access           PUBLIC
Parameter        isbn
Methods          GET
*/

booky.get("/is/:isbn",async(req,res)=>{
    // const getSPecificBook=database.books.filter(
    //     (book)=>book.ISBN===req.params.isbn
    // );
    
    const getSPecificBook=await BookModel.findOne({ISBN:req.params.isbn});
    //returns true if return / false if not returned
    if(!getSPecificBook){
        return res.json({error:`No book fouund for isbn ${req.params.isbn}`})
    }
    return res.json({book:getSPecificBook});
});

/*
Route            /c
Description      Get specific book usig isbn
Access           PUBLIC
Parameter        category
Methods          GET
*/
 
booky.get("/c/:category",async(req,res)=>{
    // const getSPecificBook=database.books.filter(
    //     (i)=>i.category.includes(req.params.category) 
    // );
    const getSPecificBook=await BookModel.findOne({category:req.params.category})
    if(!getSPecificBook){
        return res.json({error:`No book fouund for category ${req.params.category}`})
    }
    return res.json({book:getSPecificBook});

});

/*
Route            /author
Description      Get all authors
Access           PUBLIC
Parameter        NONE
Methods          GET
*/

booky.get("/author",async(req,res)=>{
    const getAllAuthors=await AuthorModel.find()
    return res.json(getAllAuthors);
});

/*
Route            /author/id
Description      Get a specific author based on id
Access           PUBLIC
Parameter        id
Methods          GET
*/
booky.get("/author/id/:id",async(req,res)=>{
   
    const getSPecificAuthor=await AuthorModel.findOne({id:req.params.id});
    if(!getSPecificAuthor){
        return res.json({Error: `no author found for id ${req.params.id}`})
    }
    return res.json({author:getSPecificAuthor});
});


/*
Route            /author/book
Description      Get a specific author based on books isbn
Access           PUBLIC
Parameter        isbn
Methods          GET
*/
booky.get("/author/book/:isbn",(req,res)=>{
    const getSPecificAuthor=database.author.filter(
        (i)=>i.books.includes(req.params.isbn)
    );
    if(getSPecificAuthor.length===0){
        return res.json({Error: `no author found for isbn ${req.params.isbn}`})
    }
    return res.json({author:getSPecificAuthor});

});

/*
Route            /publication
Description      Get all publications
Access           PUBLIC
Parameter        NONE
Methods          GET
*/

booky.get("/publication",async(req,res)=>{
    const getAllPublications=await PublicationModel.find();
    return res.json(getAllPublications);
});


//POST

/*
Route            /book/new
Description      add new books
Access           PUBLIC
Parameter        NONE
Methods          POST
*/
booky.post("/book/new",async(req,res)=>{
    const {newBook} = req.body;
    const addNewBook=BookModel.create(newBook);
    return res.json({
        books: addNewBook,
        message: "Book was added !!!"
    })
    // database.books.push(newBook);
    // return res.json({updatedBooks: database.books});
});
/*
Route            /author/new
Description      add new authors
Access           PUBLIC
Parameter        NONE
Methods          POST
*/

booky.post("/author/new",async(req,res)=>{
    const {newAuthor}=req.body;
    AuthorModel.create(newAuthor);
    return res.json({
        newAuth:newAuthor,
        message:"Author was added !!!"
    })

});
/*
Route            /publication/new
Description      add new publications
Access           PUBLIC
Parameter        NONE
Methods          POST
*/
booky.post("/publication/new",async(req,res)=>{
    const {newpublication}=req.body;
    PublicationModel.create(newpublication);
    return res.json({
        updatedpublication:newpublication,
        message:"New publication added !!!"
    });

});
//PUT
/*
Route            /book/update
Description      update the title of a book using isbn
Access           PUBLIC
Parameter        isbn
Methods          POST
*/
booky.put("/book/update/:isbn",async(req,res)=>{
    const updatedBook=await BookModel.findOneAndUpdate(
        {
            ISBN: req.params.isbn
        },
        {
            title: req.body.bookTitle
        },
        {
            new: true
        }
    );
    return res.json({
        books:updatedBook
    })
    
});
/*****Updating new author*******/
/*
Route            /book/author/update/:isbn
Description      Updating new author
Access           PUBLIC
Parameter        isbn
Methods          PUT
*/

booky.put("/book/author/update/:isbn",async(req,res)=>{
    const updatedBook=await BookModel.findOneAndUpdate(
        {
            ISBN: req.params.isbn
        },
        {
            $addToSet:{
                authors: req.body.newAuthor
            }
        },
        {
            new:true
        }
    );

    //Update the author database
    const updatedAuthor=await AuthorModel.findOneAndUpdate(
        {
         id:req.body.newAuthor   
        },{
            $addToSet:{
                books:req.params.isbn
            }
        },{
            new:true
        }
    )
    return res.json({
        books:"added new author",
        message:"Author updated"
    })

});

/*
Route            /publication/update/book
Description      update the publication of a book
Access           PUBLIC
Parameter        isbn
Methods          PUT
*/
booky.put("/publication/update/book/:isbn",(req,res)=>{
    //update publication db
    database.publication.forEach((pub)=>{
        return pub.books.push(req.params.isbn);
    });
    //upadte books db
    database.books.forEach((book)=>{
        if(book.ISBN===req.params.isbn){
            book.publications=req.body.pubId;
            return;
        }
    });
    return res.json({
        books:database.books,
        publications:database.publication,
        message:"Succesfully updated publications"
    })

});

///DELETE
/*
Route            /book/delete
Description      delete a book
Access           PUBLIC
Parameter        isbn
Methods          DELETE
*/
// booky.delete("/book/delete/:isbn",(req,res)=>{
//     //whichever book not matches with the isbn will be moved to updated database
//     const updateedBookdatabase=database.books.filter(
//         (book)=>book.ISBN!==req.params.isbn
//     )
//     database.books=updateedBookdatabase;
//     return res.json({books: database.books});
// });
booky.delete("/book/delete/:isbn",async(req,res)=>{
    const updatedBooks=await BookModel.findOneAndDelete(
        {
            ISBN:req.params.isbn
        }
    )
    return res.json({
        books: updatedBooks
    })
})
/*
Route            /book/delete/author
Description      delete a author in author db and remove from book
Access           PUBLIC
Parameter        isbn,authorId
Methods          DELETE
*/
booky.delete("/book/delete/author/:isbn/:authorId",(req,res)=>{
    //Update the book database
    database.books.forEach((book)=>{
        if(book.ISBN===req.params.isbn){
            const newAuthorList=book.author.filter(
                (i)=>i!==parseInt(req.params.authorId)
            )
            book.author=newAuthorList;
            return;
        }
    })
    //update the author database
    database.author.forEach((i)=>{
        if(i.id===parseInt(req.params.authorId)){
            i.books=i.books.filter(
                (j)=>j!==req.params.isbn
            );
            return;
        }
    })
    return res.json({
        book:database.books,
        author:database.author,
        message:"Author was deleted"
    })

});




booky.listen(3000,()=>{
    console.log("Server running");
});