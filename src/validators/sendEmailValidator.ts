import { celebrate, Joi, Segments } from 'celebrate';

export default celebrate({
  [Segments.BODY]: Joi.object().keys({
    survey_id: Joi.string().required(),
    email: Joi.string().email().required(),
  }),
});
