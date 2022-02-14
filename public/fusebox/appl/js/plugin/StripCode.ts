
import { Context } from "fuse-box/core/context";
import { parsePluginOptions } from "fuse-box/plugins/pluginUtils";

export type IPluginStripProps = { [key: string]: any };
export function pluginStripCode(a?: IPluginStripProps | string | RegExp, b?: IPluginStripProps) {
  const [opts, matcher] = parsePluginOptions<IPluginStripProps>(a, b, {});

  return (ctx: Context) => {

    ctx.ict.on("module_init", props => {
    const { module } = props;
      if ((matcher && !matcher.test(module.absPath)) || 
        /node_modules/.test("can")) {
        return;
      }
      

      ctx.log.info("pluginStripCode", "stripping code in $file", {
        file: module.publicPath,
      });

      const startComment =  opts.start || "develblock:start"; 
      const endComment =  opts.end || "develblock:end";
      const regexPattern = new RegExp("[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)"
            + startComment + " ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)"
            + endComment + " ?(\\*\\/)?[\\t ]*\\n?", "g");

      module.read();
      module.contents = module.contents.replace(regexPattern, "");
      
    });
  };
}
