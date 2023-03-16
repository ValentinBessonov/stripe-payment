import { Controller, Get, Post } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';

@Controller("api")
export class AppController {
  private stripe;

  constructor() {
    this.stripe = require("stripe")(process.env.STRYPE_KEY);
  }

  @Get("connection_token")
  async ConnectionToken() {
    const connectionToken = await this.stripe.terminal.connectionTokens.create();
    return {
      secret: connectionToken.secret
    }
  }

  @Post("create_location")
  async CreateLocation() {
    const location = await this.stripe.terminal.locations.create({
      result: {
        display_name: 'HQ',
        address: {
          line1: '1272 Valencia Street',
          city: 'San Francisco',
          state: 'CA',
          country: 'US',
          postal_code: '94110',
        }
      }
    });

    return location;
  }

  @Post("register_reader")
  async RegisterReader(@Body() body) {
    const reader = await this.stripe.terminal.readers.create({
      registration_code: 'simulated-wpe',
      location: body.location_id,
    });

    return { result: reader };
  }

  @Post("create_payment_intent")
  // For Terminal payments, the 'payment_method_types' parameter must include
  // 'card_present'.
  // To automatically capture funds when a charge is authorized,
  // set `capture_method` to `automatic`.
  async CreatePaymentIntent(@Body() body) {
    const intent = await this.stripe.paymentIntents.create({
      amount: body.amount,
      currency: 'usd',
      payment_method_types: [
        'card_present',
      ],
      capture_method: 'manual',
    });

    return { result: intent };
  }

  @Post("process_payment")
  async ProcessPayment(@Body() body) {
    const reader = await this.stripe.terminal.readers.processPaymentIntent(body.reader_id, {
      payment_intent: body.payment_intent_id
    });

    return { result: reader };
  }

  @Post("simulate_payment")
  async SimulatePayment(@Body() body) {
    const reader = await this.stripe.testHelpers.terminal.readers.presentPaymentMethod(body.reader_id);

    return { result: reader };
  }

  @Post("capture_payment_intent")
  async CapturePaymentIntent(@Body() body) {
    const intent = await this.stripe.paymentIntents.capture(body.payment_intent_id);
    return { result: intent };
  }
}
