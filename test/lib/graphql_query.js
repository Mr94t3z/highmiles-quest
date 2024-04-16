var { graphql, buildSchema } = require("graphql")
 
var schema = buildSchema(`
    {
    positions(where: { owner: "0x130946d8df113e45f44e13575012d0cff1e53e37", pool: "0xb6b2410fcbee0584314af4f859b7b896616f2e51" }) {
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