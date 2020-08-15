
/**
 * @api {post} /payment/enrollment Request Enrollment check
 * @apiVersion 0.0.2
 * @apiName Enrollment Check
 * @apiGroup Payment
 * @apiDescription This call verifies that the card is enrolled in a card authentication program.
 * @apiHeaderExample {json} Header-Request-Example:
 *     {
 *       "reference": "080bc416-2b83-49e2-800c-6303a48a2539",
 *       "session-id": "ACCESSAG_N4324342423423",
 *       "public-key": "d877a83d-742e-4ab6-be47-8c9bb8406303",
 *     }
 * @apiParamExample {json} Request-Body-Example:
 *     {
 *       "isObject": true,
 *       "request": {
 *            "cardDetail": {
 *                 "number": "4000000000002",
 *                 "expireMonth": "12",
 *                 "expireYear": "2020",
 *                 "cvv": "002"
 *            },
 *            "currency": "NGN",
 *            "amount": "2000",
 *            "firstName": "Emmanuel",
 *            "lastName": "Daniel"
 *        }
 *     }
 * @apiError (Bad Request) {validationError} request  ""request" is required"
 * @apiError (Bad Request) {validationError} request reason: Invalid request format provided for "body.request"
 * @apiError (Unprocessable Entity) {entiryError} request reason: Invalid request format provided for "body.request"
 * @apiErrorExample {json} Error-Response:
 *     HTTP 400 Bad Request
 *     {
 *        reason: "Unexpected token d in JSON at position 0"
 *        detail: "Invalid request format provided for \"body.request\""
 *        advice: "Cross check the request fields or check official documentation"
 *        documentation: "http://0.0.0.0:2000/doc"
 *     }
 *     {
 *        reason: "\"request\" is required"
 *        detail: "Invalid request format provided for \"body.request\""
 *        advice: "Cross check the request fields or check official documentation"
 *        documentation: "http://0.0.0.0:2000/doc"
 *     }
 *     HTTP 422 Unprocessable Entity
 *     {
 *        status: 422
 *        message: "Unprocessable Entity"
 *        error: "Could not authenticate this card. Check card details or try another card. Error: 3001"
 *        success: false
 *     }
 * @apiSuccessExample {json} Success-Response:
 *     HTTP 200 OK
 *    {
 *       status: 200,
 *       message: "OK",
 *       data: {
 *           authenticationPath: "ATTEMPTS_COMPLETE"
 *           authenticationTransactionId: "nrQ6Z3wgVH68cMAQCyJ1"
 *           cavv: "BwAQAgJ4IAUFBwdik3ggEETHTsU="
 *           cavvAlgorithm: "2"
 *           ecommerceIndicator: "vbv_attempted"
 *           eci: "06"
 *           eciRaw: "06"
 *           paresStatus: "A"
 *           proofXml: "<AuthProof><Time>2020 May 28 11:51:00</Time><DSUrl>https://merchantacsstag.cardinalcommerce.com/MerchantACSWeb/vereq.jsp?acqid=CYBS</DSUrl><VEReqProof><Message id="nrQ6Z3wgVH68cMAQCyJ1"><VEReq><version>1.0.2</version><pan>XXXXXXXXXXXX0101</pan><Merchant><acqBIN>469216</acqBIN><merID>ACCESSNG0000001</merID></Merchant><Browser><deviceCategory>0</deviceCategory></Browser></VEReq></Message></VEReqProof><VEResProof><Message id="nrQ6Z3wgVH68cMAQCyJ1"><VERes><version>1.0.2</version><CH><enrolled>Y</enrolled><acctID>3610723</acctID></CH><url>https://merchantacsstag.cardinalcommerce.com/MerchantACSWeb/pareq.jsp?visaattempts=true&amp;gold=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA</url><protocol>ThreeDSecure</protocol></VERes></Message></VEResProof></AuthProof>"
 *           specificationVersion: "1.0.2"
 *           veresEnrolled: "Y"
 *           xid: "bnJRNlozd2dWSDY4Y01BUUN5SjE="
 *       }
 *       success: true
 *    }
 */
