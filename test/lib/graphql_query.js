var { graphql, buildSchema } = require("graphql")
 
var schema = buildSchema(`
    {
    positions(where: { owner: "0x130946d8dF113e45f44e13575012D0cFF1E53e37", pool: "0xb6B2410fCbEe0584314af4F859b7B896616f2E51" }) {
      id
      liquidity
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
      tickLower {
        price0
      }
      tickUpper {
        price0
      }
    }
  }
  
`)
 
var rootValue = { hello: () => "Hello world!" }
 
var source = "{ hello }"
 
graphql({ schema, source, rootValue }).then(response => {
  console.log(response)
})