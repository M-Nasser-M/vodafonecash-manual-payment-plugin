import { defineMiddlewares } from "@medusajs/framework/http"
import { adminPluginMiddlewares } from "./admin/plugin/middlewares"
import { storePluginMiddlewares } from "./store/plugin/middlewares"

export default defineMiddlewares({
  routes: [...storePluginMiddlewares, ...adminPluginMiddlewares],
})
