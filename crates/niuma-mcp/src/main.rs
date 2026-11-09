use anyhow::Result;
use niuma_core::HomeLayout;

#[tokio::main]
async fn main() -> Result<()> {
    niuma_mcp::run_stdio(HomeLayout::resolve()?).await
}
