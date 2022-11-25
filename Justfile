init_stack:
  terraform \
    -chdir=./deployment \
    init

plan_stack:
  npm run build
  terraform \
    -chdir=./deployment \
    plan

deploy_stack:
  npm run build
  terraform \
    -chdir=./deployment \
    apply \
      -auto-approve

destroy_stack:
  terraform \
    -chdir=./deployment \
    destroy \
      -auto-approve
